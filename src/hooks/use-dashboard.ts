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

      const startIso = date.from.toISOString()
      const endDateStr = new Date(date.to)
      endDateStr.setHours(23, 59, 59, 999)
      const endIso = endDateStr.toISOString()

      const startDay = format(date.from, 'yyyy-MM-dd')
      const endDay = format(date.to, 'yyyy-MM-dd')

      try {
        const [transacoesRes, pacientesRes, registrosRes] = await Promise.all([
          supabase
            .from('transacoes')
            .select('id, valor, tipo, data, paciente_id')
            .gte('data', startIso)
            .lte('data', endIso),
          supabase.from('pacientes').select('id', { count: 'exact', head: true }),
          supabase
            .from('registros_diarios')
            .select('bilheteria, data')
            .gte('data', startDay)
            .lte('data', endDay),
        ])

        if (!isMounted) return

        let faturamento = 0
        let despesas = 0
        const faturamentoDia: Record<string, number> = {}
        const pacientesDia: Record<string, Set<string>> = {}

        ;(transacoesRes.data || []).forEach((t) => {
          const val = Number(t.valor)
          const day = format(new Date(t.data), 'yyyy-MM-dd')

          if (t.tipo === 'entrada') {
            faturamento += val
            faturamentoDia[day] = (faturamentoDia[day] || 0) + val
          } else if (t.tipo === 'saída') {
            despesas += val
          }

          if (t.paciente_id) {
            if (!pacientesDia[day]) pacientesDia[day] = new Set()
            pacientesDia[day].add(t.paciente_id)
          }
        })

        let bilheteriaVal = 0
        ;(registrosRes.data || []).forEach((r) => {
          bilheteriaVal += Number(r.bilheteria || 0)
        })

        const margem = faturamento > 0 ? ((faturamento - despesas) / faturamento) * 100 : 0

        setMetrics({
          faturamentoTotal: faturamento,
          totalPacientes: pacientesRes.count || 0,
          bilheteria: bilheteriaVal,
          margemLucro: margem,
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
