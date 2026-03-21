import { useState, useEffect, useCallback, useMemo } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { CalendarDays, Wallet, Building2, AlertCircle } from 'lucide-react'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getOcupacoes } from '@/services/taxa-sala'
import { Ocupacao } from '@/types/taxa-sala'

export default function Dashboard() {
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
      setError(
        'Não foi possível carregar os dados de ocupação. Verifique sua conexão e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    loadData()
  }, [loadData])

  const { receitaTotal, chartData } = useMemo(() => {
    let total = 0
    const receitaMap: Record<string, number> = {}

    ocupacoes.forEach((o) => {
      const val = Number(o.valor_cobrado || 0)
      total += val
      const nome = o.sala?.nome || 'Desconhecida'
      receitaMap[nome] = (receitaMap[nome] || 0) + val
    })

    const chart = Object.entries(receitaMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return { receitaTotal: total, chartData: chart }
  }, [ocupacoes])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-5 rounded-3xl shadow-sm border border-border/80 gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Visão Geral de Ocupações</h2>
          <p className="text-sm text-muted-foreground">
            Analise as receitas e o volume de reservas no período.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="shadow-sm border-border/60 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Wallet className="w-24 h-24 text-primary" />
          </div>
          <CardHeader className="pb-2 z-10 relative">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Receita Total no Período
            </CardTitle>
          </CardHeader>
          <CardContent className="z-10 relative">
            {loading ? (
              <Skeleton className="h-10 w-40 mt-1" />
            ) : (
              <div className="text-[36px] font-bold tracking-tight text-primary">
                {formatCurrency(receitaTotal)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <CalendarDays className="w-24 h-24 text-foreground" />
          </div>
          <CardHeader className="pb-2 z-10 relative">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Total de Ocupações
            </CardTitle>
          </CardHeader>
          <CardContent className="z-10 relative">
            {loading ? (
              <Skeleton className="h-10 w-20 mt-1" />
            ) : (
              <div className="text-[36px] font-bold tracking-tight text-foreground">
                {ocupacoes.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Receita por Sala</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {loading ? (
            <div className="flex h-full items-end gap-4 px-4 pb-4">
              <Skeleton className="h-[40%] w-full rounded-t-sm" />
              <Skeleton className="h-[70%] w-full rounded-t-sm" />
              <Skeleton className="h-[50%] w-full rounded-t-sm" />
              <Skeleton className="h-[90%] w-full rounded-t-sm" />
            </div>
          ) : chartData.length > 0 ? (
            <ChartContainer
              config={{ value: { label: 'Receita', color: 'hsl(var(--primary))' } }}
              className="h-full w-full"
            >
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
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
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-3">
              <Building2 className="w-12 h-12 opacity-20" />
              <p>Nenhuma ocupação registrada no período selecionado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
