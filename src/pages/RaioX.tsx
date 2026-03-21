import { useState, useEffect, useCallback } from 'react'
import { FileDown, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, format, parseISO, eachMonthOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

export default function RaioX() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({ faturamento: 0, custos: 0, lucro: 0, margem: 0 })
  const [chartData, setChartData] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    if (!dateRange?.from) return

    setLoading(true)
    const startDay = format(dateRange.from, 'yyyy-MM-dd')
    const endDay = format(dateRange.to || dateRange.from, 'yyyy-MM-dd')

    try {
      const [registrosRes, despesasRes, funcionariosRes] = await Promise.all([
        supabase
          .from('registros_diarios')
          .select('data, faturamento_total')
          .gte('data', startDay)
          .lte('data', endDay),
        supabase
          .from('despesas')
          .select('data_vencimento, valor')
          .gte('data_vencimento', startDay)
          .lte('data_vencimento', endDay),
        supabase.from('funcionarios').select('salario_base'),
      ])

      let faturamento = 0
      let custos = 0
      const evolutionMap: Record<string, { faturamento: number; custos: number }> = {}

      const months = eachMonthOfInterval({
        start: startOfMonth(dateRange.from),
        end: startOfMonth(dateRange.to || dateRange.from),
      })

      let funcMonthlyCost = 0
      if (funcionariosRes.data) {
        funcMonthlyCost =
          funcionariosRes.data.reduce((acc, f) => acc + Number(f.salario_base || 0), 0) * 1.4744
      }

      months.forEach((m) => {
        const monthStr = format(m, 'yyyy-MM')
        evolutionMap[monthStr] = { faturamento: 0, custos: funcMonthlyCost }
        custos += funcMonthlyCost
      })

      if (registrosRes.data) {
        registrosRes.data.forEach((r) => {
          const val = Number(r.faturamento_total || 0)
          faturamento += val

          const month = r.data.substring(0, 7) // yyyy-MM
          if (evolutionMap[month]) {
            evolutionMap[month].faturamento += val
          }
        })
      }

      if (despesasRes.data) {
        despesasRes.data.forEach((d) => {
          const val = Number(d.valor || 0)
          custos += val

          const month = d.data_vencimento?.substring(0, 7) || startDay.substring(0, 7)
          if (evolutionMap[month]) {
            evolutionMap[month].custos += val
          }
        })
      }

      const lucro = faturamento - custos
      const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0

      setMetrics({ faturamento, custos, lucro, margem })

      const sortedChartData = Object.entries(evolutionMap)
        .map(([month, data]) => {
          const date = parseISO(`${month}-01`)
          return {
            sortKey: month,
            name: format(date, 'MMM/yy', { locale: ptBR }),
            faturamento: data.faturamento,
            custos: data.custos,
            lucro: data.faturamento - data.custos,
          }
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))

      setChartData(sortedChartData)
    } catch (err) {
      console.error('Error fetching RaioX data:', err)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('raiox_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registros_diarios' },
        fetchData,
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'funcionarios' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatPercent = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(
      value / 100,
    )

  const handlePrint = () => window.print()

  return (
    <div className="p-6 md:p-10 animate-fade-in print:p-0 print:m-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Raio-X Financeiro</h1>
          <p className="text-slate-500 mt-1">
            Análise completa da saúde financeira (inclui custos fixos de RH)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 md:flex-none h-10 px-4 gap-2 bg-white shadow-sm hover:bg-slate-50"
          >
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 mb-8 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row items-end gap-5">
          <div className="flex-1 w-full max-w-sm">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Filtrar por Período
            </label>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          <Button
            variant="ghost"
            onClick={() => setDateRange(undefined)}
            className="w-full md:w-auto h-10 px-6 text-slate-600 hover:text-slate-900"
          >
            <X className="w-4 h-4 mr-2" /> Limpar Filtro
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group bg-white">
          {loading ? (
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                Faturamento Total
              </p>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                {formatCurrency(metrics.faturamento)}
              </h3>
              <p className="text-[13px] text-slate-500 font-medium">Receita acumulada</p>
            </CardContent>
          )}
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group bg-white">
          {loading ? (
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                Custos Totais
              </p>
              <h3 className="text-3xl font-bold text-[#e03131] mb-2">
                {formatCurrency(metrics.custos)}
              </h3>
              <p className="text-[13px] text-slate-500 font-medium">Despesas operacionais e RH</p>
            </CardContent>
          )}
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group bg-white">
          {loading ? (
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                Lucro Líquido
              </p>
              <h3
                className={`text-3xl font-bold mb-2 ${metrics.lucro >= 0 ? 'text-[#2b8a3e]' : 'text-[#e03131]'}`}
              >
                {formatCurrency(metrics.lucro)}
              </h3>
              <p className="text-[13px] text-slate-500 font-medium">Resultado final</p>
            </CardContent>
          )}
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group bg-white">
          {loading ? (
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                Margem
              </p>
              <h3
                className={`text-3xl font-bold mb-2 ${metrics.margem >= 20 ? 'text-[#3b5bdb]' : 'text-amber-500'}`}
              >
                {formatPercent(metrics.margem)}
              </h3>
              <p className="text-[13px] text-slate-500 font-medium">Lucratividade</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Evolução Financeira Section */}
      <div className="mt-10">
        <Card className="shadow-sm border-slate-200/60 rounded-xl bg-white overflow-hidden print:shadow-none print:border-none">
          <div className="p-6 pb-4 border-b border-slate-100 print:border-none print:px-0">
            <h2 className="text-[16px] font-semibold text-[#8d5b4c]">
              Evolução Financeira (Mensal)
            </h2>
          </div>
          <div className="p-6 print:px-0">
            {loading ? (
              <div className="w-full h-[400px] border border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/30">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-[400px] border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50/30">
                <p className="text-slate-500 font-medium">Nenhum dado encontrado para o período.</p>
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    faturamento: { label: 'Faturamento', color: '#2b8a3e' },
                    custos: { label: 'Custos', color: '#e03131' },
                    lucro: { label: 'Lucro', color: '#3b5bdb' },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `R$${val / 1000}k`}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(val: any) => formatCurrency(Number(val))}
                          />
                        }
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <ReferenceLine y={0} stroke="#cbd5e1" />
                      <Bar
                        dataKey="faturamento"
                        name="Faturamento"
                        fill="var(--color-faturamento)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="custos"
                        name="Custos"
                        fill="var(--color-custos)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="lucro"
                        name="Lucro"
                        fill="var(--color-lucro)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
