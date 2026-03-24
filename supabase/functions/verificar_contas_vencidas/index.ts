import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all pending or due accounts (but not Paid)
    const { data: contas, error: contasError } = await supabase
      .from('contas_fixas')
      .select('*')
      .neq('status', 'Pago')

    if (contasError) throw contasError

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    let updatedCount = 0
    let remindersCount = 0

    for (const conta of contas) {
      if (!conta.data_vencimento) continue

      const dueDate = new Date(conta.data_vencimento)
      dueDate.setUTCHours(0, 0, 0, 0)

      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let isVencida = false
      let isProxima = false

      if (diffDays < 0) {
        isVencida = true
      } else if (diffDays >= 0 && diffDays <= 3) {
        isProxima = true
      }

      if (isVencida) {
        if (conta.status !== 'Vencido') {
          await supabase.from('contas_fixas').update({ status: 'Vencido' }).eq('id', conta.id)
          updatedCount++
        }

        const { data: existing } = await supabase
          .from('lembretes_contas')
          .select('id')
          .eq('conta_id', conta.id)
          .eq('tipo', 'vencida')
          .single()

        if (!existing) {
          await supabase.from('lembretes_contas').insert({
            conta_id: conta.id,
            conta_fixa_id: conta.id,
            tipo: 'vencida',
            tipo_lembrete: 'push',
            usuario_id: conta.usuario_id,
            data_envio: new Date().toISOString(),
          })
          remindersCount++
        }
      } else if (isProxima) {
        const { data: existing } = await supabase
          .from('lembretes_contas')
          .select('id')
          .eq('conta_id', conta.id)
          .eq('tipo', 'proxima')
          .single()

        if (!existing) {
          await supabase.from('lembretes_contas').insert({
            conta_id: conta.id,
            conta_fixa_id: conta.id,
            tipo: 'proxima',
            tipo_lembrete: 'push',
            usuario_id: conta.usuario_id,
            data_envio: new Date().toISOString(),
          })
          remindersCount++
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Verificação concluída. ${updatedCount} contas atualizadas para Vencido. ${remindersCount} lembretes criados.`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
