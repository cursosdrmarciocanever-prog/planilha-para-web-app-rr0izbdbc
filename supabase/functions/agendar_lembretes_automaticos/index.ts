import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Variáveis de ambiente ausentes.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  async function logAutomacao(status: string, mensagem_erro: string | null = null) {
    await supabase.from('logs_automacao').insert({
      funcao: 'agendar_lembretes_automaticos',
      status,
      mensagem_erro,
    })
  }

  try {
    // 1. Chamar verificar_contas_vencidas para identificar e atualizar contas próximas (3 dias) ou vencidas
    const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
      'verificar_contas_vencidas',
    )

    if (verifyError) {
      throw new Error(
        `Erro ao verificar contas: ${verifyError.message || JSON.stringify(verifyError)}`,
      )
    }

    const contasProcessadas = verifyData?.processadas || []
    let emailsEnviados = 0
    let falhasEnvio = 0

    // 2. Para cada conta processada, verificar se precisa enviar o email e chamar enviar_email_lembrete
    for (const conta of contasProcessadas) {
      if (conta.usuario_id) {
        // Verifica se o lembrete específico já foi enviado para evitar envios duplicados
        const { data: lembrete } = await supabase
          .from('lembretes_contas')
          .select('id, enviado')
          .eq('conta_fixa_id', conta.id)
          .eq('tipo', conta.classificacao_alerta)
          .single()

        if (lembrete && !lembrete.enviado) {
          const { error: emailError } = await supabase.functions.invoke('enviar_email_lembrete', {
            body: {
              conta_fixa_id: conta.id,
              usuario_id: conta.usuario_id,
            },
          })

          if (emailError) {
            falhasEnvio++
            console.error(`Erro ao enviar email para a conta ${conta.id}:`, emailError)
          } else {
            emailsEnviados++
          }
        }
      }
    }

    // 3. Registrar logs de execução
    const msgSucesso = `Contas processadas: ${contasProcessadas.length}. Emails enviados: ${emailsEnviados}. Falhas: ${falhasEnvio}.`
    await logAutomacao('sucesso', msgSucesso)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Rotina automática executada com sucesso',
        detalhes: msgSucesso,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    await logAutomacao('erro', error.message || 'Erro desconhecido')
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
