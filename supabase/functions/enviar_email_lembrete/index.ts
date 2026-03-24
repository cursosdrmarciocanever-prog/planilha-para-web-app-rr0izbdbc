import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // Utiliza SERVICE_ROLE_KEY para acesso full (incluindo auth.admin e bypass do RLS)
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis SUPABASE_URL ou chaves do Supabase ausentes.')
    }

    if (!resendApiKey) {
      throw new Error('Variável RESEND_API_KEY não configurada nos secrets.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { conta_fixa_id, usuario_id } = await req.json()

    if (!conta_fixa_id || !usuario_id) {
      throw new Error('Parâmetros conta_fixa_id e usuario_id são obrigatórios.')
    }

    // 1) Buscar dados da conta no Supabase
    const { data: conta, error: contaError } = await supabase
      .from('contas_fixas')
      .select('*')
      .eq('id', conta_fixa_id)
      .single()

    if (contaError || !conta) {
      throw new Error(`Erro ao buscar dados da conta: ${contaError?.message || 'Não encontrada'}`)
    }

    // 1.1) Buscar dados do usuário (email)
    let userEmail = ''

    // Tentativa principal usando admin API (requer service_role key)
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(usuario_id)

    if (userData?.user?.email) {
      userEmail = userData.user.email
    } else {
      // Fallback: tentar buscar na tabela pública de profiles
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
      throw new Error('E-mail do usuário não foi encontrado no Supabase.')
    }

    // Formatar valores para a mensagem
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(conta.valor)

    const dataVencimentoFormatada = new Date(
      `${conta.data_vencimento}T00:00:00Z`,
    ).toLocaleDateString('pt-BR')

    const linkParaPagar = 'https://planilha-para-web-app-dd61d.goskip.app/'

    // 2) Usar API do Resend para disparar o e-mail
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Lembretes <onboarding@resend.dev>', // Domínio de testes do Resend (atualizar quando adicionar o domínio customizado)
        to: userEmail,
        subject: `Lembrete: Conta a Pagar - ${conta.descricao}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h2 style="color: #2563eb; margin-top: 0;">Lembrete de Vencimento</h2>
            <p>Olá,</p>
            <p>Este é um lembrete importante sobre a conta <strong>${conta.descricao}</strong>.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0; font-size: 16px;"><strong>Valor:</strong> ${valorFormatado}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Data de Vencimento:</strong> ${dataVencimentoFormatada}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${linkParaPagar}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Acessar o Sistema</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
              Atenciosamente,<br>Sua Gestão Financeira
            </p>
          </div>
        `,
      }),
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      throw new Error(`Erro retornado pela API do Resend: ${JSON.stringify(resendData)}`)
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
        'Aviso: O E-mail foi enviado, mas ocorreu um erro ao atualizar o status na tabela lembretes_contas:',
        updateError,
      )
    }

    // 4) Retornar status de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'E-mail de lembrete enviado com sucesso.',
        email_id: resendData.id,
      }),
      {
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
