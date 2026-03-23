import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity } from 'lucide-react'

export function EvolucaoCustoHora({ horasMes }: { horasMes: number }) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: despesas } = await supabase.from('despesas').select('valor, created_at')

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

      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const key = format(date, 'MMM/yy', { locale: ptBR })

        if (monthlyTotals[key]) {
          foundAny = true
          const val = monthlyTotals[key]
          const h100 = val / hBase
          chartData.push({ name: key, custo100: h100, custo50: h100 / 0.5, custo20: h100 / 0.2 })
        } else if (i === 0 && !foundAny) {
          // Se não houver histórico anterior, força apenas o mês atual
          const currentTotal = despesas?.reduce((acc, d) => acc + Number(d.valor || 0), 0) || 0
          const h100 = currentTotal / hBase
          chartData.push({ name: key, custo100: h100, custo50: h100 / 0.5, custo20: h100 / 0.2 })
        }
      }

      setData(chartData)
    }
    load()
  }, [horasMes])

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 bg-card">
      <CardHeader className="pb-4 border-b border-border/40 bg-secondary/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Histórico do Custo por Hora
        </CardTitle>
        <CardDescription>
          Acompanhe a evolução mensal do Custo Hora com diferentes ocupações.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 h-[400px]">
        <ChartContainer
          config={{
            custo100: { label: '100% Ocupação', color: 'hsl(var(--primary))' },
            custo50: { label: '50% Ocupação', color: '#eab308' }, // amber-500
            custo20: { label: '20% Ocupação', color: '#ef4444' }, // red-500
          }}
          className="h-full w-full"
        >
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
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
            <ChartLegend content={<ChartLegendContent />} className="mt-4" />
            <Line
              type="monotone"
              dataKey="custo100"
              stroke="var(--color-custo100)"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="custo50"
              stroke="var(--color-custo50)"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="custo20"
              stroke="var(--color-custo20)"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
