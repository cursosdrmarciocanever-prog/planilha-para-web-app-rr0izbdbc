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

  // Helper para chamar a Edge Function registrar_log
  async function logAutomacao(status: string, mensagem_erro: string | null = null) {
    try {
      await supabase.functions.invoke('registrar_log', {
        body: {
          funcao: 'agendar_lembretes_automaticos',
          status,
          mensagem_erro,
        },
      })
    } catch (e) {
      console.error('Falha ao invocar registrar_log:', e)
    }
  }

  try {
    // 1) Quando inicia (status: 'pendente')
    await logAutomacao('pendente')

    // 2. Chamar verificar_contas_vencidas para identificar e atualizar contas próximas (3 dias) ou vencidas
    const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
      'verificar_contas_vencidas',
    )

    if (verifyError) {
      throw new Error(
        `Erro ao invocar verificar_contas_vencidas: ${verifyError.message || JSON.stringify(verifyError)}`,
      )
    }

    if (!verifyData?.success) {
      throw new Error(
        `A verificação de contas falhou: ${verifyData?.error || 'Erro desconhecido na função verificar_contas_vencidas'}`,
      )
    }

    const contasProcessadas = verifyData?.processadas || []
    let emailsEnviados = 0
    let falhasEnvio = 0

    // 3. Para cada conta processada, verificar se precisa enviar o email e chamar enviar_email_lembrete
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

    // 4) Se conseguir chamar verificar_contas_vencidas e processar tudo (status: 'sucesso')
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
    // 5) Se houver erro em qualquer etapa (status: 'erro')
    await logAutomacao('erro', error.message || 'Erro desconhecido')

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
