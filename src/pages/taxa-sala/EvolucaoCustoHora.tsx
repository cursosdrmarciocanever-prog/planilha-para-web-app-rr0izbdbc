import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { format, subMonths, isAfter, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

export function EvolucaoCustoHora({ horasMes }: { horasMes: number }) {
  const [rawData, setRawData] = useState<any[]>([])
  const [period, setPeriod] = useState<'3m' | '6m' | '12m'>('6m')
  const [show100, setShow100] = useState(true)
  const [show50, setShow50] = useState(true)
  const [show20, setShow20] = useState(true)
  const [limite] = useLocalStorage('taxa_limite_custo_hora', 250)

  useEffect(() => {
    async function load() {
      // Fetch up to 12 months for flexibility
      const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11)).toISOString()

      const { data: despesas } = await supabase
        .from('despesas')
        .select('valor, created_at')
        .gte('created_at', twelveMonthsAgo)

      const monthlyTotals: Record<string, number> = {}

      if (despesas) {
        despesas.forEach((d) => {
          if (d.created_at) {
            const key = format(new Date(d.created_at), 'MMM/yy', { locale: ptBR })
            if (!monthlyTotals[key]) monthlyTotals[key] = 0
            monthlyTotals[key] += Number(d.valor || 0)
          }
        })
      }

      const chartData = []
      let foundAny = false
      const hBase = horasMes || 220

      // Generate last 12 months sequence
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const key = format(date, 'MMM/yy', { locale: ptBR })

        if (monthlyTotals[key]) {
          foundAny = true
          const val = monthlyTotals[key]
          const h100 = val / hBase
          chartData.push({
            name: key,
            date: date,
            custo100: h100,
            custo50: h100 / 0.5,
            custo20: h100 / 0.2,
          })
        } else if (i === 0 && !foundAny) {
          // Force current month if no history
          const currentTotal = despesas?.reduce((acc, d) => acc + Number(d.valor || 0), 0) || 0
          const h100 = currentTotal / hBase
          chartData.push({
            name: key,
            date: date,
            custo100: h100,
            custo50: h100 / 0.5,
            custo20: h100 / 0.2,
          })
        } else if (foundAny || i === 0) {
          // Fill gaps with 0 or last known if we want, but let's just put 0 to show actuals
          chartData.push({ name: key, date: date, custo100: 0, custo50: 0, custo20: 0 })
        }
      }

      setRawData(chartData)
    }
    load()
  }, [horasMes])

  const filteredData = useMemo(() => {
    const monthsToKeep = period === '3m' ? 3 : period === '6m' ? 6 : 12
    return rawData.slice(-monthsToKeep)
  }, [rawData, period])

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { min: 0, max: 0, avg: 0, trend: 0 }

    const validData = filteredData.filter((d) => d.custo100 > 0)
    if (validData.length === 0) return { min: 0, max: 0, avg: 0, trend: 0 }

    const values = validData.map((d) => d.custo100)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    let trend = 0
    if (validData.length >= 2) {
      const last = validData[validData.length - 1].custo100
      const prev = validData[validData.length - 2].custo100
      if (prev > 0) {
        trend = ((last - prev) / prev) * 100
      }
    }

    return { min, max, avg, trend }
  }, [filteredData])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 bg-card">
      <CardHeader className="pb-4 border-b border-border/40 bg-secondary/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Histórico do Custo por Hora
          </CardTitle>
          <CardDescription>
            Acompanhe a evolução mensal com diferentes cenários de ocupação.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex bg-background rounded-full p-1 border border-border/50 shadow-sm">
            {(['3m', '6m', '12m'] as const).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                onClick={() => setPeriod(p)}
                className={cn(
                  'h-7 px-3 text-xs rounded-full font-medium transition-all',
                  period === p
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-secondary text-muted-foreground',
                )}
              >
                {p.replace('m', ' meses')}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-background px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <Checkbox
                id="c100"
                checked={show100}
                onCheckedChange={(c) => setShow100(!!c)}
                className="w-3.5 h-3.5"
              />
              <Label
                htmlFor="c100"
                className="text-xs text-muted-foreground font-medium cursor-pointer"
              >
                100%
              </Label>
            </div>
            <div className="flex items-center space-x-1.5">
              <Checkbox
                id="c50"
                checked={show50}
                onCheckedChange={(c) => setShow50(!!c)}
                className="w-3.5 h-3.5"
              />
              <Label
                htmlFor="c50"
                className="text-xs text-muted-foreground font-medium cursor-pointer"
              >
                50%
              </Label>
            </div>
            <div className="flex items-center space-x-1.5">
              <Checkbox
                id="c20"
                checked={show20}
                onCheckedChange={(c) => setShow20(!!c)}
                className="w-3.5 h-3.5"
              />
              <Label
                htmlFor="c20"
                className="text-xs text-muted-foreground font-medium cursor-pointer"
              >
                20%
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px] w-full mb-6">
          <ChartContainer
            config={{
              custo100: { label: '100% Ocupação', color: 'hsl(var(--primary))' },
              custo50: { label: '50% Ocupação', color: '#eab308' }, // amber-500
              custo20: { label: '20% Ocupação', color: '#ef4444' }, // red-500
            }}
            className="h-full w-full"
          >
            <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.6}
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

              <ReferenceLine
                y={limite}
                stroke="hsl(var(--destructive))"
                strokeDasharray="4 4"
                opacity={0.6}
                label={{
                  position: 'top',
                  value: `Limite: R$ ${limite}`,
                  fill: 'hsl(var(--destructive))',
                  fontSize: 11,
                }}
              />

              {show100 && (
                <Line
                  type="monotone"
                  dataKey="custo100"
                  stroke="var(--color-custo100)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {show50 && (
                <Line
                  type="monotone"
                  dataKey="custo50"
                  stroke="var(--color-custo50)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {show20 && (
                <Line
                  type="monotone"
                  dataKey="custo20"
                  stroke="var(--color-custo20)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </ComposedChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/40">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Menor Custo (100%)
            </p>
            <p className="text-xl font-black text-foreground">{formatCurrency(stats.min)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Maior Custo (100%)
            </p>
            <p className="text-xl font-black text-foreground">{formatCurrency(stats.max)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Média do Período
            </p>
            <p className="text-xl font-black text-foreground">{formatCurrency(stats.avg)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Tendência (Último Mês)
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {stats.trend > 0 ? (
                <>
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                  <span className="text-lg font-bold text-rose-600">
                    +{stats.trend.toFixed(1)}%
                  </span>
                </>
              ) : stats.trend < 0 ? (
                <>
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                  <span className="text-lg font-bold text-emerald-600">
                    {stats.trend.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-lg font-bold text-muted-foreground">Estável</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
