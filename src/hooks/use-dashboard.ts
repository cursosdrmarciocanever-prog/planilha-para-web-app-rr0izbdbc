import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DateRange } from 'react-day-picker'
import { format, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useDashboardData(date: DateRange | undefined) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
          setMetrics({ faturamentoTotal: 0, totalPacientes: 0, bilheteria: 0, margemLucro: 0 })
          setChartData({ faturamento: [], pacientes: [] })
          setLoading(false)
          setError(null)
        }
        return
      }

      setLoading(true)
      setError(null)

      const startDay = format(date.from, 'yyyy-MM-dd')
      const endDay = format(date.to, 'yyyy-MM-dd')

      try {
        const [registrosRes, pacientesRes, despesasRes] = await Promise.all([
          supabase
            .from('registros_diarios')
            .select('data, faturamento_total, bilheteria, total_consultas')
            .gte('data', startDay)
            .lte('data', endDay),
          supabase.from('pacientes').select('id', { count: 'exact', head: true }),
          supabase
            .from('despesas')
            .select('valor')
            .gte('data_vencimento', startDay)
            .lte('data_vencimento', endDay),
        ])

        if (!isMounted) return

        if (registrosRes.error) throw registrosRes.error
        if (pacientesRes.error) throw pacientesRes.error
        if (despesasRes.error) throw despesasRes.error

        let faturamento = 0
        let bilheteriaVal = 0
        let despesasVal = 0

        const faturamentoDia: Record<string, number> = {}
        const pacientesDia: Record<string, number> = {}

        ;(registrosRes.data || []).forEach((r: any) => {
          const day = r.data // format is yyyy-MM-dd
          const faturamentoVal = Number(r.faturamento_total ?? 0)
          const bilheteriaDia = Number(r.bilheteria ?? 0)
          const consultasDia = Number(r.total_consultas ?? 0)

          faturamento += faturamentoVal
          bilheteriaVal += bilheteriaDia

          faturamentoDia[day] = (faturamentoDia[day] ?? 0) + faturamentoVal
          pacientesDia[day] = (pacientesDia[day] ?? 0) + consultasDia
        })

        ;(despesasRes.data || []).forEach((d: any) => {
          despesasVal += Number(d.valor ?? 0)
        })

        const margem = faturamento > 0 ? ((faturamento - despesasVal) / faturamento) * 100 : 0

        setMetrics({
          faturamentoTotal: faturamento ?? 0,
          totalPacientes: pacientesRes.count ?? 0,
          bilheteria: bilheteriaVal ?? 0,
          margemLucro: margem ?? 0,
        })

        const interval = eachDayOfInterval({ start: date.from, end: date.to })
        setChartData({
          faturamento: interval.map((d) => ({
            name: format(d, 'dd/MM', { locale: ptBR }),
            total: faturamentoDia[format(d, 'yyyy-MM-dd')] ?? 0,
          })),
          pacientes: interval.map((d) => ({
            name: format(d, 'dd/MM', { locale: ptBR }),
            total: pacientesDia[format(d, 'yyyy-MM-dd')] ?? 0,
          })),
        })
      } catch (err) {
        console.error('Dashboard error:', err)
        if (isMounted) {
          setError(
            'Não foi possível carregar os dados do painel. Verifique sua conexão ou tente novamente mais tarde.',
          )
          setMetrics({ faturamentoTotal: 0, totalPacientes: 0, bilheteria: 0, margemLucro: 0 })
          setChartData({ faturamento: [], pacientes: [] })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [date])

  return { metrics, chartData, loading, error }
}
