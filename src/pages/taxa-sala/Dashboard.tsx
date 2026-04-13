import { useState, useEffect, useCallback, useMemo } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Wallet, Building2, TrendingUp, DollarSign, Percent, AlertCircle } from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getOcupacoes } from '@/services/taxa-sala'
import { Ocupacao } from '@/types/taxa-sala'
import { cn } from '@/lib/utils'
import { AnaliseProcedimentos } from './AnaliseProcedimentos'
import { MetasPorSala } from './MetasPorSala'

export default function Dashboard({ custoHora100, totalDespesas, salas, reloadSalas }: any) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const from = date?.from ? date.from.toISOString() : undefined
      let to = undefined
      if (date?.to) {
        const toDate = new Date(date.to)
        toDate.setHours(23, 59, 59, 999)
        to = toDate.toISOString()
      }
      const data = await getOcupacoes(from, to)
      setOcupacoes(data)
    } catch (e) {
      setError('Não foi possível carregar os dados. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    loadData()
  }, [loadData])

  const metrics = useMemo(() => {
    let receitaTotal = 0
    let custoTotal = 0
    let horasTotal = 0
    const salaMap: Record<string, { receita: number; custo: number; horas: number }> = {}

    ocupacoes.forEach((o) => {
      const receita = Number(o.valor_cobrado || 0)
      receitaTotal += receita

      const start = new Date(o.horario_inicio).getTime()
      const end = new Date(o.horario_fim).getTime()
      const diffHours = Math.max(0, (end - start) / (1000 * 60 * 60))
      horasTotal += diffHours

      const taxaHora = Number(o.sala?.taxa_hora || 0)
      const custo = diffHours * taxaHora
      custoTotal += custo

      const nome = o.sala?.nome || 'Sem Sala'
      if (!salaMap[nome]) salaMap[nome] = { receita: 0, custo: 0, horas: 0 }
      salaMap[nome].receita += receita
      salaMap[nome].custo += custo
      salaMap[nome].horas += diffHours
    })

    const margemTotal = receitaTotal - custoTotal
    const rentabilidade = receitaTotal > 0 ? (margemTotal / receitaTotal) * 100 : 0

    const chartData = Object.entries(salaMap)
      .map(([name, data]) => ({
        name,
        receita: data.receita,
        custo: data.custo,
        margem: data.receita - data.custo,
        rentabilidade: data.receita > 0 ? ((data.receita - data.custo) / data.receita) * 100 : 0,
      }))
      .sort((a, b) => b.margem - a.margem)

    return { receitaTotal, custoTotal, margemTotal, rentabilidade, horasTotal, chartData }
  }, [ocupacoes])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-5 rounded-3xl shadow-sm border border-border/80 gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Análise de Rentabilidade</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe a margem de contribuição e lucratividade por sala.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="bg-destructive/5 text-destructive border-destructive/20 rounded-2xl"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Erro no carregamento</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Faturamento Salas"
          value={formatCurrency(metrics.receitaTotal)}
          icon={Wallet}
          loading={loading}
          color="text-primary"
        />
        <MetricCard
          title="Custo Operacional"
          value={formatCurrency(metrics.custoTotal)}
          icon={DollarSign}
          loading={loading}
          color="text-destructive"
        />
        <MetricCard
          title="Margem de Contribuição"
          value={formatCurrency(metrics.margemTotal)}
          icon={TrendingUp}
          loading={loading}
          color={metrics.margemTotal >= 0 ? 'text-emerald-600' : 'text-destructive'}
        />
        <MetricCard
          title="Rentabilidade"
          value={`${metrics.rentabilidade.toFixed(1)}%`}
          icon={Percent}
          loading={loading}
          color={metrics.rentabilidade >= 0 ? 'text-emerald-600' : 'text-destructive'}
        />
      </div>

      <Card className="shadow-sm border-border/60 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Performance por Sala (Método GM)</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {loading ? (
            <div className="flex h-full items-end gap-4 px-4 pb-4">
              <Skeleton className="h-[40%] w-full rounded-t-sm" />
              <Skeleton className="h-[70%] w-full rounded-t-sm" />
              <Skeleton className="h-[50%] w-full rounded-t-sm" />
            </div>
          ) : metrics.chartData.length > 0 ? (
            <ChartContainer
              config={{
                receita: { label: 'Faturamento', color: 'hsl(var(--primary))' },
                custo: { label: 'Custo', color: 'hsl(var(--destructive))' },
                margem: { label: 'Margem', color: '#10b981' }, // emerald-500
              }}
              className="h-full w-full"
            >
              <ComposedChart
                data={metrics.chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(val) => `R$ ${val}`}
                  width={80}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="receita"
                  fill="var(--color-receita)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="custo"
                  fill="var(--color-custo)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  type="monotone"
                  dataKey="margem"
                  stroke="var(--color-margem)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--color-margem)' }}
                />
              </ComposedChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-3">
              <Building2 className="w-12 h-12 opacity-20" />
              <p>Nenhuma ocupação registrada no período selecionado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INTEGRAÇÃO DE METAS POR SALA */}
      {salas && (
        <MetasPorSala
          salas={salas}
          ocupacoes={ocupacoes}
          totalDespesas={totalDespesas}
          reloadSalas={reloadSalas}
        />
      )}

      {/* INTEGRAÇÃO DE ANÁLISE DE PROCEDIMENTOS */}
      {custoHora100 !== undefined && <AnaliseProcedimentos custoHora100={custoHora100} />}
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, loading, color }: any) {
  return (
    <Card className="shadow-sm border-border/60 rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Icon className={cn('w-24 h-24', color)} />
      </div>
      <CardHeader className="pb-2 z-10 relative">
        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="z-10 relative">
        {loading ? (
          <Skeleton className="h-10 w-24 mt-1" />
        ) : (
          <div className={cn('text-[32px] font-bold tracking-tight', color)}>{value}</div>
        )}
      </CardContent>
    </Card>
  )
}
