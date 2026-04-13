import { useMemo } from 'react'
import { Pie, PieChart, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  descricao: string
  valor: number
  categoria: string
}

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#06b6d4',
  '#14b8a6',
  '#f43f5e',
]

export function CostDistributionChart({ despesas }: { despesas: Despesa[] }) {
  const chartData = useMemo(() => {
    const grouped = despesas.reduce(
      (acc, d) => {
        // Agrupa por descrição conforme exemplo "Financiamento representa 39%..."
        const key = d.descricao || 'Outros'
        acc[key] = (acc[key] || 0) + Number(d.valor)
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(grouped)
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }, [despesas])

  const total = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData])

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    chartData.forEach((item) => {
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
      const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(item.value)
      config[item.name] = {
        label: `${item.name} (${percent}%) - ${formattedValue}`,
        color: item.fill,
      }
    })
    return config
  }, [chartData, total])

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">
          Distribuição de Custos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col justify-center">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="w-full aspect-square max-h-[300px] mx-auto"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    valueFormatter={(val) =>
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Number(val),
                      )
                    }
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                strokeWidth={2}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent className="flex-wrap gap-2 text-[11px] mt-4" />}
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Nenhuma despesa para exibir
          </div>
        )}
      </CardContent>
    </Card>
  )
}
