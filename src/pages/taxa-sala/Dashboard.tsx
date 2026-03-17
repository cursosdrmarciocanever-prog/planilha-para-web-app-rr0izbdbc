import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getOcupacoes } from '@/services/taxa-sala'
import { Ocupacao } from '@/types/taxa-sala'

export default function Dashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>([])

  useEffect(() => {
    loadData()
  }, [date])

  const loadData = async () => {
    try {
      const from = date?.from ? date.from.toISOString() : undefined
      const to = date?.to ? date.to.toISOString() : undefined
      const data = await getOcupacoes(from, to)
      setOcupacoes(data)
    } catch (e) {
      console.error(e)
    }
  }

  const receitaTotal = ocupacoes.reduce((acc, o) => acc + Number(o.valor_cobrado), 0)

  const receitaPorSalaMap = ocupacoes.reduce(
    (acc, o) => {
      const nome = o.sala?.nome || 'Desconhecida'
      acc[nome] = (acc[nome] || 0) + Number(o.valor_cobrado)
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(receitaPorSalaMap).map(([name, value]) => ({
    name,
    value,
  }))

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-5 rounded-2xl shadow-sm border border-border/80">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Visão Geral</h2>
          <p className="text-sm text-muted-foreground">
            Analise as receitas geradas pelas ocupações.
          </p>
        </div>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="shadow-sm border-border/60 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Receita Total no Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-bold tracking-tight text-primary">
              {formatCurrency(receitaTotal)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Total de Ocupações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[32px] font-bold tracking-tight">{ocupacoes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60 rounded-2xl">
        <CardHeader>
          <CardTitle>Receita por Sala</CardTitle>
        </CardHeader>
        <CardContent className="h-[380px]">
          {chartData.length > 0 ? (
            <ChartContainer
              config={{ value: { label: 'Receita (R$)', color: 'hsl(var(--primary))' } }}
              className="h-full w-full"
            >
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `R$ ${val}`}
                  width={80}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Nenhuma ocupação no período selecionado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
