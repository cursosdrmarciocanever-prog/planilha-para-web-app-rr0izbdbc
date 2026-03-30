import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DateRange } from 'react-day-picker'
import { format, eachDayOfInterval, eachMonthOfInterval, startOfMonth } from 'date-fns'
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
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      const fromDate = date.from
      const toDate = date.to || date.from

      const startDay = format(fromDate, 'yyyy-MM-dd')
      const endDay = format(toDate, 'yyyy-MM-dd')

      let queryLancamentos = supabase
        .from('diario_atendimentos')
        .select('data, valor_consulta, valor_procedimento, paciente_nome')
        .gte('data', startDay)
        .lte('data', endDay)

      if (userId) {
        queryLancamentos = queryLancamentos.eq('user_id', userId)
      }

      const [lancamentosRes, despesasRes, funcionariosRes] = await Promise.all([
        queryLancamentos,
        supabase
          .from('despesas')
          .select('valor')
          .gte('data_vencimento', startDay)
          .lte('data_vencimento', endDay),
        supabase.from('funcionarios').select('salario_base'),
      ])

      let faturamento = 0
      let totalDespesas = 0
      let pacientesSet = new Set<string>()
      let totalLancamentos = 0

      const faturamentoDia: Record<string, number> = {}
      const pacientesDia: Record<string, number> = {}

      if (lancamentosRes.data) {
        lancamentosRes.data.forEach((l: any) => {
          const day = l.data
          const valCons = Number(l.valor_consulta ?? 0)
          const valProc = Number(l.valor_procedimento ?? 0)
          const valorVal = valCons + valProc

          faturamento += valorVal
          if (l.paciente_nome) {
            pacientesSet.add(l.paciente_nome.trim().toLowerCase())
          }
          totalLancamentos++

          if (day) {
            faturamentoDia[day] = (faturamentoDia[day] ?? 0) + valorVal

            if (valCons > 0 || (valCons === 0 && valProc === 0)) {
              pacientesDia[day] = (pacientesDia[day] ?? 0) + 1
            }
          }
        })
      }

      const totalPacientes = pacientesSet.size
      const bilheteriaVal = totalLancamentos > 0 ? faturamento / totalLancamentos : 0

      // Calcula os custos fixos proporcionais aos meses do filtro
      const months = eachMonthOfInterval({
        start: startOfMonth(fromDate),
        end: startOfMonth(toDate),
      })

      let funcMonthlyCost = 0
      if (funcionariosRes.data) {
        funcMonthlyCost =
          funcionariosRes.data.reduce((acc, f) => acc + Number(f.salario_base || 0), 0) * 1.4744
      }

      totalDespesas += funcMonthlyCost * months.length

      if (despesasRes.data) {
        despesasRes.data.forEach((d: any) => {
          totalDespesas += Number(d.valor ?? 0)
        })
      }

      const margem = faturamento > 0 ? ((faturamento - totalDespesas) / faturamento) * 100 : 0

      setMetrics({
        faturamentoTotal: faturamento,
        totalPacientes: totalPacientes,
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

    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diario_atendimentos' }, () =>
        fetchData(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, () =>
        fetchData(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funcionarios' }, () =>
        fetchData(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  return { metrics, chartData, loading, error }
}
