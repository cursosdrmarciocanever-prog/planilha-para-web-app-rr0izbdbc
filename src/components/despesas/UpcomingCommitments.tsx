import { useMemo } from 'react'
import { format, addMonths, startOfMonth, endOfMonth, parseISO, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { AlertTriangle, CalendarRange, TrendingUp, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function UpcomingCommitments({ contas }: { contas: any[] }) {
  // 1. Relatório de Parcelas
  const parcelamentos = useMemo(() => {
    const regex = /(.*?)\s*\(?(\d+)\/(\d+)\)?$/
    const grupos = new Map<string, any>()

    contas.forEach((c) => {
      if (c._table !== 'despesa') return
      const match = c.descricao?.match(regex)
      if (match) {
        const baseName = match[1].trim()
        const atual = parseInt(match[2], 10)
        const total = parseInt(match[3], 10)
        const valor = Number(c.valor)
        const dataVenc = c.data_vencimento ? parseISO(c.data_vencimento) : null

        if (!grupos.has(baseName)) {
          grupos.set(baseName, {
            baseName,
            totalParcelas: total,
            valorParcela: valor,
            parcelas: [],
          })
        }

        const grupo = grupos.get(baseName)
        if (total > grupo.totalParcelas) {
          grupo.totalParcelas = total
        }
        grupo.parcelas.push({ atual, dataVenc, status: c.status })
      }
    })

    const ativos: any[] = []
    grupos.forEach((g) => {
      g.parcelas.sort((a: any, b: any) => {
        if (!a.dataVenc || !b.dataVenc) return 0
        return a.dataVenc.getTime() - b.dataVenc.getTime()
      })

      const lastParcela = g.parcelas[g.parcelas.length - 1]
      const proximaParcela =
        g.parcelas.find((p: any) => p.status !== 'Pago') || g.parcelas[g.parcelas.length - 1]

      if (g.parcelas.some((p: any) => p.status !== 'Pago')) {
        ativos.push({
          ...g,
          termino: lastParcela.dataVenc,
          progresso: `${proximaParcela.atual}/${g.totalParcelas}`,
          proximaData: proximaParcela.dataVenc,
        })
      }
    })

    return ativos.sort((a, b) => {
      if (!a.termino || !b.termino) return 0
      return a.termino.getTime() - b.termino.getTime()
    })
  }, [contas])

  // 2. Comprometimento Mensal (Próximos 6 meses)
  const projection = useMemo(() => {
    const today = new Date()
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = addMonths(startOfMonth(today), i)
      return {
        date,
        label: format(date, 'MMM/yy', { locale: ptBR }).toUpperCase(),
      }
    })

    return months.map((m) => {
      let despesasVal = 0
      let fixasVal = 0

      contas.forEach((c) => {
        if (!c.data_vencimento) return
        const dataVenc = parseISO(c.data_vencimento)

        if (c._table === 'despesa') {
          if (isSameMonth(dataVenc, m.date)) {
            despesasVal += Number(c.valor)
          }
        } else if (c._table === 'conta_fixa') {
          if (c.frequencia === 'Única') {
            if (isSameMonth(dataVenc, m.date)) {
              fixasVal += Number(c.valor)
            }
          } else {
            // Recorrente
            if (dataVenc <= endOfMonth(m.date)) {
              fixasVal += Number(c.valor)
            }
          }
        }
      })

      return {
        ...m,
        fixas: fixasVal,
        despesas: despesasVal,
        total: despesasVal + fixasVal,
      }
    })
  }, [contas])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const nextMonthProjection = projection.length > 1 ? projection[1] : projection[0]

  return (
    <div className="space-y-6">
      {/* Alerta de Faturamento Mínimo */}
      {nextMonthProjection && (
        <Alert
          variant="default"
          className="bg-amber-500/10 text-amber-900 dark:text-amber-400 border-amber-500/20 shadow-sm"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <AlertTitle className="font-bold text-lg text-amber-800 dark:text-amber-500">
            Faturamento Mínimo Necessário ({nextMonthProjection.label})
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm flex items-center gap-2 font-medium">
            Seu comprometimento total para o próximo mês é de{' '}
            <span className="font-bold text-lg">{formatCurrency(nextMonthProjection.total)}</span>.
            Fature pelo menos este valor para não ter prejuízo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Comprometimento */}
        <Card className="shadow-sm border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Comprometimento Mensal (Próximos 6 meses)
            </CardTitle>
            <CardDescription>Soma de parcelas futuras e contas fixas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  fixas: { label: 'Contas Fixas', color: 'hsl(var(--primary))' },
                  despesas: { label: 'Parcelas/Despesas', color: 'hsl(var(--destructive))' },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projection} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={
                        <ChartTooltipContent formatter={(val: number) => formatCurrency(val)} />
                      }
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    />
                    <Bar
                      dataKey="fixas"
                      stackId="a"
                      fill="var(--color-fixas)"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="despesas"
                      stackId="a"
                      fill="var(--color-despesas)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Parcelamentos */}
        <Card className="shadow-sm border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" />
              Parcelamentos Ativos
            </CardTitle>
            <CardDescription>Acompanhe o término das suas compras parceladas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {parcelamentos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-3 opacity-20" />
                <p>Nenhum parcelamento ativo encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Progresso</TableHead>
                    <TableHead className="text-right">Valor/Mês</TableHead>
                    <TableHead className="text-right">Término</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelamentos.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{p.baseName}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-secondary/50 px-2 py-1 rounded-md text-xs font-bold border border-border/50">
                          {p.progresso}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(p.valorParcela)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {p.termino
                          ? format(p.termino, 'MMM/yyyy', { locale: ptBR }).toUpperCase()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
