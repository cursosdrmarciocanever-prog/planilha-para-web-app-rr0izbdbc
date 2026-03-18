import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DateRange } from 'react-day-picker'
import { format, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useDashboardData(date: DateRange | undefined) {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    faturamentoTotal: 0,
    totalPacientes: 0,
    bilheteria: 0,
    margemLucro: 0,
  })
  const [chartData, setChartData] = useState<{
    faturamento: { name: string; total: number }[]
    pacientes: { name: string; total: number }[]
  }>({ faturamento: [], pacientes: [] })

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      if (!date?.from || !date?.to) {
        if (isMounted) {
          setMetrics({
            faturamentoTotal: 0,
            totalPacientes: 0,
            bilheteria: 0,
            margemLucro: 0,
          })
          setChartData({ faturamento: [], pacientes: [] })
          setLoading(false)
        }
        return
      }

      setLoading(true)

      const startDay = format(date.from, 'yyyy-MM-dd')
      const endDay = format(date.to, 'yyyy-MM-dd')

      try {
        const [transacoesRes, pacientesRes, ocupacoesRes, despesasRes] = await Promise.all([
          supabase
            .from('transacoes')
            .select('id, valor, tipo, data, paciente_id')
            .gte('data', startDay)
            .lte('data', endDay),
          supabase.from('pacientes').select('id', { count: 'exact', head: true }),
          supabase
            .from('ocupacao_salas')
            .select('id, valor_cobrado, horario_inicio')
            .gte('horario_inicio', date.from.toISOString())
            .lte(
              'horario_inicio',
              new Date(new Date(date.to).setHours(23, 59, 59, 999)).toISOString(),
            ),
          supabase
            .from('despesas')
            .select('id, valor')
            .gte('data_vencimento', startDay)
            .lte('data_vencimento', endDay),
        ])

        if (!isMounted) return

        let faturamento = 0
        let despesasVal = 0
        let bilheteriaVal = 0

        const faturamentoDia: Record<string, number> = {}
        const pacientesDia: Record<string, Set<string>> = {}

        ;(transacoesRes.data || []).forEach((t: any) => {
          const val = Number(t.valor)
          const day = t.data // format is yyyy-MM-dd

          if (t.tipo === 'receita') {
            faturamento += val
            faturamentoDia[day] = (faturamentoDia[day] || 0) + val
          } else if (t.tipo === 'despesa') {
            despesasVal += val
          }

          if (t.paciente_id) {
            if (!pacientesDia[day]) pacientesDia[day] = new Set()
            pacientesDia[day].add(t.paciente_id)
          }
        })

        ;(despesasRes.data || []).forEach((d: any) => {
          despesasVal += Number(d.valor || 0)
        })

        ;(ocupacoesRes.data || []).forEach((o: any) => {
          bilheteriaVal += Number(o.valor_cobrado || 0)
        })

        const margem = faturamento > 0 ? ((faturamento - despesasVal) / faturamento) * 100 : 0

        setMetrics({
          faturamentoTotal: faturamento || 0,
          totalPacientes: pacientesRes.count || 0,
          bilheteria: bilheteriaVal || 0,
          margemLucro: margem || 0,
        })

        const interval = eachDayOfInterval({ start: date.from, end: date.to })
        setChartData({
          faturamento: interval.map((d) => ({
            name: format(d, 'dd/MM', { locale: ptBR }),
            total: faturamentoDia[format(d, 'yyyy-MM-dd')] || 0,
          })),
          pacientes: interval.map((d) => ({
            name: format(d, 'dd/MM', { locale: ptBR }),
            total: pacientesDia[format(d, 'yyyy-MM-dd')]?.size || 0,
          })),
        })
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [date])

  return { metrics, chartData, loading }
}
