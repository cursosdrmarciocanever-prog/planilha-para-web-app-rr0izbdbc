import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Tratamento de CORS para chamadas do browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // Necessário SERVICE_ROLE_KEY para usar auth.admin e acessar profiles bypassando RLS (se necessário no background)
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis SUPABASE_URL ou chaves do Supabase ausentes nos secrets.')
    }

    if (!resendApiKey) {
      throw new Error('Variável RESEND_API_KEY não configurada nos secrets do Supabase.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await req.json()
    const { conta_fixa_id, usuario_id } = body

    if (!conta_fixa_id || !usuario_id) {
      throw new Error(
        'Parâmetros conta_fixa_id e usuario_id são obrigatórios no corpo da requisição.',
      )
    }

    // 1) Buscar dados da conta no Supabase
    const { data: conta, error: contaError } = await supabase
      .from('contas_fixas')
      .select('*')
      .eq('id', conta_fixa_id)
      .single()

    if (contaError || !conta) {
      throw new Error(
        `Erro ao buscar dados da conta (ID: ${conta_fixa_id}): ${contaError?.message || 'Conta não encontrada'}`,
      )
    }

    // 1.1) Buscar e-mail do usuário
    let userEmail = ''

    // Tenta usar auth.admin (requer SERVICE_ROLE_KEY)
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(usuario_id)

    if (userData?.user?.email) {
      userEmail = userData.user.email
    } else {
      // Fallback: tentar buscar na tabela profiles (se existir e for acessível)
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', usuario_id)
        .single()

      if (profile?.email) {
        userEmail = profile.email
      }
    }

    if (!userEmail) {
      throw new Error(`E-mail do usuário (ID: ${usuario_id}) não encontrado no banco de dados.`)
    }

    // Formatar valores para exibição no corpo do email
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(conta.valor || 0)

    const dataVencimentoFormatada = conta.data_vencimento
      ? new Date(`${conta.data_vencimento}T00:00:00Z`).toLocaleDateString('pt-BR')
      : 'Não definida'

    // URL principal da aplicação
    const linkParaPagar = 'https://planilha-para-web-app-dd61d.goskip.app/'

    // 2) Disparar e-mail via API do Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Lembretes Financeiros <onboarding@resend.dev>', // Usando domínio de testes padrão do Resend
        to: userEmail,
        subject: `Lembrete: Conta a Pagar - ${conta.descricao}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h2 style="color: #2563eb; margin-top: 0;">Lembrete de Vencimento</h2>
            <p>Olá,</p>
            <p>Este é um lembrete automático importante referente à sua conta <strong>${conta.descricao}</strong>.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0; font-size: 16px;"><strong>Valor Original:</strong> ${valorFormatado}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Data de Vencimento:</strong> ${dataVencimentoFormatada}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${linkParaPagar}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Acessar o Sistema para Pagamento</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
              Atenciosamente,<br>Seu Assistente Financeiro
            </p>
          </div>
        `,
      }),
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      throw new Error(`Falha no provedor de E-mail (Resend): ${JSON.stringify(resendData)}`)
    }

    // 3) Atualizar a tabela lembretes_contas com enviado = true
    const { error: updateError } = await supabase
      .from('lembretes_contas')
      .update({
        enviado: true,
        data_envio: new Date().toISOString(),
      })
      .eq('conta_fixa_id', conta_fixa_id)
      .eq('usuario_id', usuario_id)

    if (updateError) {
      console.warn(
        'Aviso: O E-mail foi disparado com sucesso, mas ocorreu um erro ao atualizar o status na tabela lembretes_contas:',
        updateError,
      )
      // Não lançamos erro aqui para não invalidar o envio que já ocorreu.
    }

    // 4) Retornar status de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'E-mail de lembrete enviado com sucesso.',
        email_id: resendData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
