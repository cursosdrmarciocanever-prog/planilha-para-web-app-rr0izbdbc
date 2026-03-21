import { useState, useEffect, useCallback } from 'react'
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

  const fetchData = useCallback(async () => {
    if (!date?.from) {
      setMetrics({ faturamentoTotal: 0, totalPacientes: 0, bilheteria: 0, margemLucro: 0 })
      setChartData({ faturamento: [], pacientes: [] })
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fromDate = date.from
      const toDate = date.to || date.from

      const startDay = format(fromDate, 'yyyy-MM-dd')
      const endDay = format(toDate, 'yyyy-MM-dd')

      // Use Promise.all but handle errors individually so one table doesn't break everything
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

      let faturamento = 0
      let bilheteriaVal = 0
      let despesasVal = 0

      const faturamentoDia: Record<string, number> = {}
      const pacientesDia: Record<string, number> = {}

      if (registrosRes.error) {
        console.error('Error fetching registros_diarios:', registrosRes.error)
      } else if (registrosRes.data) {
        registrosRes.data.forEach((r: any) => {
          const day = r.data // format is yyyy-MM-dd
          const faturamentoVal = Number(r.faturamento_total ?? 0)
          const bilheteriaDia = Number(r.bilheteria ?? 0)
          const consultasDia = Number(r.total_consultas ?? 0)

          faturamento += faturamentoVal
          bilheteriaVal += bilheteriaDia

          faturamentoDia[day] = (faturamentoDia[day] ?? 0) + faturamentoVal
          pacientesDia[day] = (pacientesDia[day] ?? 0) + consultasDia
        })
      }

      if (despesasRes.error) {
        console.error('Error fetching despesas:', despesasRes.error)
      } else if (despesasRes.data) {
        despesasRes.data.forEach((d: any) => {
          despesasVal += Number(d.valor ?? 0)
        })
      }

      if (pacientesRes.error) {
        console.error('Error fetching pacientes:', pacientesRes.error)
      }

      const margem = faturamento > 0 ? ((faturamento - despesasVal) / faturamento) * 100 : 0

      setMetrics({
        faturamentoTotal: faturamento,
        totalPacientes: pacientesRes.count ?? 0,
        bilheteria: bilheteriaVal,
        margemLucro: margem,
      })

      const interval = eachDayOfInterval({ start: fromDate, end: toDate })
      setChartData({
        faturamento: interval.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          return {
            name: format(d, 'dd/MM', { locale: ptBR }),
            total: faturamentoDia[key] ?? 0,
          }
        }),
        pacientes: interval.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          return {
            name: format(d, 'dd/MM', { locale: ptBR }),
            total: pacientesDia[key] ?? 0,
          }
        }),
      })
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Não foi possível carregar os dados do painel.')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchData()

    // Real-time synchronization to ensure changes in "Diário" instantly update the dashboard
    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registros_diarios' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pacientes' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  return { metrics, chartData, loading, error }
}
