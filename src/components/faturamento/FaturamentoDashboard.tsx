import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b']

export function FaturamentoDashboard() {
  const [loading, setLoading] = useState(true)
  const [mesFiltro, setMesFiltro] = useState(format(new Date(), 'yyyy-MM'))
  const [lancamentosMes, setLancamentosMes] = useState<any[]>([])
  const [despesasMes, setDespesasMes] = useState<any[]>([])
  const [chartData6m, setChartData6m] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [lineData, setLineData] = useState<any[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    const [ano, mes] = mesFiltro.split('-')
    const dateObj = new Date(Number(ano), Number(mes) - 1, 1)

    const currentMonthStart = format(startOfMonth(dateObj), 'yyyy-MM-dd')
    const currentMonthEnd = format(endOfMonth(dateObj), 'yyyy-MM-dd')
    const start6m = format(startOfMonth(subMonths(dateObj, 5)), 'yyyy-MM-dd')

    let queryLanc = supabase
      .from('lancamentos_pacientes')
      .select('*')
      .gte('data_atendimento', start6m)
      .lte('data_atendimento', currentMonthEnd)

    if (userId) {
      queryLanc = queryLanc.eq('user_id', userId)
    }

    const [resLancamentos, resDespesas] = await Promise.all([
      queryLanc,
      supabase
        .from('despesas')
        .select('*')
        .gte('data_vencimento', start6m)
        .lte('data_vencimento', currentMonthEnd),
    ])

    const allLancamentos = resLancamentos.data || []
    const allDespesas = resDespesas.data || []

    // KPIs do Mês Selecionado
    const lancamentosAtual = allLancamentos.filter((l) => l.data_atendimento >= currentMonthStart)
    const despesasAtual = allDespesas.filter((d) => d.data_vencimento >= currentMonthStart)

    setLancamentosMes(lancamentosAtual)
    setDespesasMes(despesasAtual)

    // Gráficos de 6 Meses relativos ao mês selecionado
    const monthsMap: Record<string, any> = {}
    for (let i = 5; i >= 0; i--) {
      const m = startOfMonth(subMonths(dateObj, i))
      const key = format(m, 'yyyy-MM')
      const label = format(m, 'MMM/yy', { locale: ptBR })
      monthsMap[key] = {
        name: label,
        sortKey: key,
        entradas: 0,
        saidas: 0,
        countConsultas: 0,
        countProcedimentos: 0,
        faturamentoConsultas: 0,
        faturamentoProcedimentos: 0,
      }
    }

    allLancamentos.forEach((l) => {
      const dateVal = l.data_atendimento || l.data
      const key = dateVal ? dateVal.substring(0, 7) : null
      if (key && monthsMap[key]) {
        const totalVal = Number(l.valor || 0)

        monthsMap[key].entradas += totalVal

        const cat = (l.categoria || l.tipo || '').toLowerCase()
        if (cat.includes('consulta')) {
          monthsMap[key].countConsultas++
          monthsMap[key].faturamentoConsultas += totalVal
        } else if (cat.includes('procedimento')) {
          monthsMap[key].countProcedimentos++
          monthsMap[key].faturamentoProcedimentos += totalVal
        }
      }
    })

    allDespesas.forEach((d) => {
      const key = d.data_vencimento ? d.data_vencimento.substring(0, 7) : null
      if (key && monthsMap[key]) {
        monthsMap[key].saidas += Number(d.valor || 0)
      }
    })

    const barData = Object.values(monthsMap).sort((a: any, b: any) =>
      a.sortKey.localeCompare(b.sortKey),
    )

    const lineChartData = barData.map((d: any) => ({
      name: d.name,
      ticketGeral:
        d.countConsultas + d.countProcedimentos > 0
          ? d.entradas / (d.countConsultas + d.countProcedimentos)
          : 0,
      ticketConsultas: d.countConsultas > 0 ? d.faturamentoConsultas / d.countConsultas : 0,
      ticketProcedimentos:
        d.countProcedimentos > 0 ? d.faturamentoProcedimentos / d.countProcedimentos : 0,
    }))

    // Gráfico de Pizza (Mês Selecionado)
    const pieMap: Record<string, number> = {}
    lancamentosAtual.forEach((l) => {
      const p =
        l.forma_pagamento === 'Cartão de Crédito' && l.parcelas && l.parcelas > 1
          ? `${l.forma_pagamento} ${l.parcelas}x`
          : l.forma_pagamento || 'Outro'
      const val = Number(l.valor || 0)
      pieMap[p] = (pieMap[p] || 0) + val
    })
    const pieChartData = Object.keys(pieMap).map((k) => ({ name: k, value: pieMap[k] }))

    setChartData6m(barData)
    setLineData(lineChartData)
    setPieData(pieChartData)

    setLoading(false)
  }, [mesFiltro])

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel('faturamento_dashboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lancamentos_pacientes' },
        () => {
          loadData()
        },
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const faturamentoTotal = lancamentosMes.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
  const totalDespesas = despesasMes.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
  const resultadoLiquido = faturamentoTotal - totalDespesas

  const valorConfirmado = faturamentoTotal
  const valorPendente = 0

  const consultas = lancamentosMes.filter((l) =>
    (l.categoria || l.tipo || '').toLowerCase().includes('consulta'),
  )
  const faturamentoConsultas = consultas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
  const ticketConsultas = consultas.length > 0 ? faturamentoConsultas / consultas.length : 0

  const procedimentos = lancamentosMes.filter((l) =>
    (l.categoria || l.tipo || '').toLowerCase().includes('procedimento'),
  )
  const faturamentoProcedimentos = procedimentos.reduce(
    (acc, curr) => acc + Number(curr.valor || 0),
    0,
  )
  const ticketProcedimentos =
    procedimentos.length > 0 ? faturamentoProcedimentos / procedimentos.length : 0

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Controles de Filtro e Atualização */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
        <div className="space-y-1.5 w-full max-w-[200px]">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Mês de Análise
          </label>
          <Input
            type="month"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
            className="h-11 rounded-xl bg-secondary/30"
          />
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          disabled={loading}
          className="h-11 px-6 rounded-xl gap-2 shadow-sm w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card shadow-sm border-border/60 md:col-span-1 col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(faturamentoTotal)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Confirmado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(valorConfirmado)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-yellow-600 uppercase tracking-wider">
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(valorPendente)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalDespesas)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/60 md:col-span-1 col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Resultado Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-black ${resultadoLiquido >= 0 ? 'text-emerald-600' : 'text-destructive'}`}
            >
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(resultadoLiquido)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-secondary/10 pb-4">
            <CardTitle className="text-lg">Métricas de Consultas (Mês)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nº Atendimentos</span>{' '}
                <strong className="text-lg">{consultas.length}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor Total</span>{' '}
                <strong className="text-lg">{formatCurrency(faturamentoConsultas)}</strong>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Ticket Médio
                </span>{' '}
                <strong className="text-xl text-primary">{formatCurrency(ticketConsultas)}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-secondary/10 pb-4">
            <CardTitle className="text-lg">Métricas de Procedimentos (Mês)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nº Procedimentos</span>{' '}
                <strong className="text-lg">{procedimentos.length}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor Total</span>{' '}
                <strong className="text-lg">{formatCurrency(faturamentoProcedimentos)}</strong>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Ticket Médio
                </span>{' '}
                <strong className="text-xl text-primary">
                  {formatCurrency(ticketProcedimentos)}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Dashboard - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Barras: Entradas x Saídas 6 meses */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-secondary/10">
            <CardTitle className="text-[15px]">Entradas vs Saídas (6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              {loading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ChartContainer
                  config={{
                    entradas: { label: 'Entradas', color: 'hsl(var(--primary))' },
                    saidas: { label: 'Saídas', color: '#ef4444' },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData6m}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(val) => `R$${val / 1000}k`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(val: any) => formatCurrency(Number(val))}
                          />
                        }
                        cursor={{ fill: 'var(--theme-ui-muted)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="entradas"
                        name="Entradas"
                        fill="var(--color-entradas)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="saidas"
                        name="Saídas"
                        fill="var(--color-saidas)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Linha: Ticket Médio 6 meses */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-secondary/10">
            <CardTitle className="text-[15px]">Evolução Ticket Médio (6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              {loading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ChartContainer
                  config={{
                    ticketGeral: { label: 'Geral', color: '#64748b' },
                    ticketConsultas: { label: 'Consultas', color: '#0ea5e9' },
                    ticketProcedimentos: { label: 'Procedimentos', color: '#8b5cf6' },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(val) => `R$${val}`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(val: any) => formatCurrency(Number(val))}
                          />
                        }
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey="ticketGeral"
                        name="Geral"
                        stroke="var(--color-ticketGeral)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ticketConsultas"
                        name="Consultas"
                        stroke="var(--color-ticketConsultas)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ticketProcedimentos"
                        name="Proced."
                        stroke="var(--color-ticketProcedimentos)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Pizza: Forma de Pagamento */}
        <Card className="shadow-sm border-border/60 lg:col-span-2">
          <CardHeader className="border-b border-border/40 bg-secondary/10">
            <CardTitle className="text-[15px]">
              Distribuição por Forma de Pagamento (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full flex items-center justify-center">
              {loading ? (
                <Skeleton className="w-[250px] h-[250px] rounded-full" />
              ) : pieData.length === 0 ? (
                <p className="text-muted-foreground">Sem dados no período.</p>
              ) : (
                <ChartContainer config={{}} className="h-full w-full max-w-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
