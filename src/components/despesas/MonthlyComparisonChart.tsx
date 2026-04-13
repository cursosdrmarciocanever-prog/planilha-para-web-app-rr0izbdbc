import { useState, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface Despesa {
  id: string
  data_vencimento: string
  categoria: string
  valor: number
}

export function MonthlyComparisonChart({ despesas }: { despesas: Despesa[] }) {
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    despesas.forEach((d) => {
      if (d.data_vencimento) {
        const date = parseISO(d.data_vencimento)
        months.add(format(date, 'yyyy-MM'))
      }
    })
    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }, [despesas])

  const [month1, setMonth1] = useState<string>(availableMonths[1] || availableMonths[0] || '')
  const [month2, setMonth2] = useState<string>(availableMonths[0] || '')

  // Mantém os selects válidos
  useMemo(() => {
    if (!availableMonths.includes(month1) && availableMonths.length > 0) {
      setMonth1(availableMonths[1] || availableMonths[0])
    }
    if (!availableMonths.includes(month2) && availableMonths.length > 0) {
      setMonth2(availableMonths[0])
    }
  }, [availableMonths, month1, month2])

  const chartData = useMemo(() => {
    if (!month1 || !month2) return []

    const dataMap: Record<string, { category: string; month1: number; month2: number }> = {}

    despesas.forEach((d) => {
      if (!d.data_vencimento) return
      const m = format(parseISO(d.data_vencimento), 'yyyy-MM')
      if (m !== month1 && m !== month2) return

      const cat = d.categoria || 'Sem Categoria'
      if (!dataMap[cat]) dataMap[cat] = { category: cat, month1: 0, month2: 0 }

      if (m === month1) dataMap[cat].month1 += Number(d.valor)
      if (m === month2) dataMap[cat].month2 += Number(d.valor)
    })

    return Object.values(dataMap)
  }, [despesas, month1, month2])

  const formatMonth = (m: string) => {
    if (!m) return ''
    const [year, month] = m.split('-')
    return format(new Date(Number(year), Number(month) - 1, 1), 'MMM/yy', {
      locale: ptBR,
    }).toUpperCase()
  }

  const chartConfig: ChartConfig = {
    month1: {
      label: formatMonth(month1) || 'Mês 1',
      color: '#94a3b8',
    },
    month2: {
      label: formatMonth(month2) || 'Mês 2',
      color: '#3b82f6',
    },
  }

  const totalMonth1 = chartData.reduce((acc, curr) => acc + curr.month1, 0)
  const totalMonth2 = chartData.reduce((acc, curr) => acc + curr.month2, 0)
  const diff = totalMonth2 - totalMonth1
  const diffPercent = totalMonth1 > 0 ? (diff / totalMonth1) * 100 : 0

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/60">
      <CardHeader className="pb-2 space-y-4">
        <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
          Comparativo Mensal
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={month1} onValueChange={setMonth1}>
            <SelectTrigger className="w-[110px] h-8 text-xs bg-secondary/50">
              <SelectValue placeholder="Mês 1" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatMonth(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs font-medium text-muted-foreground">vs</span>
          <Select value={month2} onValueChange={setMonth2}>
            <SelectTrigger className="w-[110px] h-8 text-xs bg-secondary/50">
              <SelectValue placeholder="Mês 2" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatMonth(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col justify-end">
        {chartData.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6 p-2 bg-secondary/30 rounded-md">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Variação Total:
              </span>
              <div
                className={`flex items-center text-sm font-bold ${diff > 0 ? 'text-destructive' : 'text-emerald-500'}`}
              >
                {diff > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {diff > 0 ? '+' : ''}
                {diffPercent.toFixed(1)}%
                <span className="ml-1 opacity-70 font-normal">
                  (
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    diff,
                  )}
                  )
                </span>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="w-full aspect-[4/3] max-h-[220px]">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip
                  cursor={{ fill: 'var(--theme-ui-muted)' }}
                  content={
                    <ChartTooltipContent
                      valueFormatter={(val) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(val))
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} className="mt-2" />
                <Bar
                  dataKey="month1"
                  fill="var(--color-month1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="month2"
                  fill="var(--color-month2)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm pb-8">
            Selecione dois meses com dados para comparar
          </div>
        )}
      </CardContent>
    </Card>
  )
}
