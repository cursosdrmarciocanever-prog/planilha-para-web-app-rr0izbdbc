import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente ausentes. Verifique os Supabase Secrets.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: contas, error: contasError } = await supabase
      .from('contas_fixas')
      .select('*')
      .neq('status', 'Pago')

    if (contasError) throw contasError

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const contasProcessadas = []

    for (const conta of contas) {
      if (!conta.data_vencimento) continue

      const dueDate = new Date(`${conta.data_vencimento}T00:00:00Z`)

      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

      const isVencida = diffDays < 0
      const isProxima = diffDays >= 0 && diffDays <= 3

      if (isVencida || isProxima) {
        let statusUpdated = false
        let novoStatus = conta.status

        if (isVencida && conta.status !== 'Vencido') {
          await supabase.from('contas_fixas').update({ status: 'Vencido' }).eq('id', conta.id)

          novoStatus = 'Vencido'
          statusUpdated = true
        }

        const tipoCategoria = isVencida ? 'vencida' : 'proxima'

        const { data: existing } = await supabase
          .from('lembretes_contas')
          .select('id')
          .eq('conta_fixa_id', conta.id)
          .eq('tipo', tipoCategoria)
          .single()

        let lembreteCriado = false

        if (!existing) {
          await supabase.from('lembretes_contas').insert({
            conta_id: conta.id,
            conta_fixa_id: conta.id,
            tipo: tipoCategoria,
            tipo_lembrete: 'ambos',
            usuario_id: conta.usuario_id,
            data_envio: new Date().toISOString(),
            enviado: false,
            notificado: false,
            lido: false,
          })
          lembreteCriado = true
        }

        contasProcessadas.push({
          id: conta.id,
          usuario_id: conta.usuario_id,
          descricao: conta.descricao,
          valor: conta.valor,
          data_vencimento: conta.data_vencimento,
          status_anterior: conta.status,
          status_atual: novoStatus,
          dias_para_vencer: diffDays,
          atualizou_status: statusUpdated,
          criou_lembrete: lembreteCriado,
          classificacao_alerta: tipoCategoria,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Verificação concluída com sucesso. ${contasProcessadas.length} contas processadas.`,
        processadas: contasProcessadas,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
