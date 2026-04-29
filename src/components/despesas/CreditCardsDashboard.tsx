import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CreditCard } from 'lucide-react'
import { format, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface Despesa {
  id: string
  data_vencimento: string
  valor: number
  conta_pagamento?: string
  status: string
}

export function CreditCardsDashboard({ despesas }: { despesas: Despesa[] }) {
  const cartoes = despesas.filter(
    (d) =>
      d.conta_pagamento === 'Cartão de Crédito Unicred' ||
      d.conta_pagamento === 'Cartão de Crédito Sicoob',
  )

  const nextMonths = Array.from({ length: 6 }).map((_, i) => {
    const date = addMonths(new Date(), i)
    return {
      monthKey: format(date, 'yyyy-MM'),
      label: format(date, 'MMM/yy', { locale: ptBR }).toUpperCase(),
      Unicred: 0,
      Sicoob: 0,
    }
  })

  cartoes.forEach((d) => {
    if (!d.data_vencimento) return
    const date = parseISO(d.data_vencimento)
    const key = format(date, 'yyyy-MM')

    const monthData = nextMonths.find((m) => m.monthKey === key)
    if (monthData) {
      if (d.conta_pagamento === 'Cartão de Crédito Unicred') {
        monthData.Unicred += Number(d.valor)
      } else if (d.conta_pagamento === 'Cartão de Crédito Sicoob') {
        monthData.Sicoob += Number(d.valor)
      }
    }
  })

  const today = new Date()
  const currentDay = today.getDate()

  const isUnicredClosing = currentDay >= 5 && currentDay <= 10
  const isSicoobClosing = currentDay >= 14 && currentDay <= 19

  const chartConfig = {
    Unicred: {
      label: 'Fatura Unicred',
      color: '#3b82f6', // blue-500
    },
    Sicoob: {
      label: 'Fatura Sicoob',
      color: '#10b981', // emerald-500
    },
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      {(isUnicredClosing || isSicoobClosing) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isUnicredClosing && (
            <Alert
              variant="destructive"
              className="bg-rose-50 border-rose-200 text-rose-800 shadow-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção: Fechamento Unicred</AlertTitle>
              <AlertDescription>
                O Cartão de Crédito Unicred fecha/vence no dia 10. Prepare-se para o pagamento da
                fatura.
              </AlertDescription>
            </Alert>
          )}
          {isSicoobClosing && (
            <Alert
              variant="destructive"
              className="bg-amber-50 border-amber-200 text-amber-800 shadow-sm"
            >
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Atenção: Fechamento Sicoob</AlertTitle>
              <AlertDescription className="text-amber-700">
                O Cartão de Crédito Sicoob fecha/vence no dia 19. Prepare-se para o pagamento da
                fatura.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Projeção de Faturas (Cartões)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Faturas projetadas para os próximos 6 meses
            </p>
          </div>
          <CreditCard className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {cartoes.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Nenhuma despesa em cartão de crédito encontrada.
            </div>
          ) : (
            <div className="h-[250px] w-full mt-4">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={nextMonths} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `R$ ${val}`}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={80}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(val) => formatCurrency(Number(val))} />
                    }
                  />
                  <Bar
                    dataKey="Unicred"
                    fill="var(--color-Unicred)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Sicoob"
                    fill="var(--color-Sicoob)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
