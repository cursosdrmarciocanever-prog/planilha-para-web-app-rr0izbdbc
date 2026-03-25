import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

export function FaturamentoDashboard() {
  const [loading, setLoading] = useState(true)
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [despesas, setDespesas] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const start = format(startOfMonth(new Date()), 'yyyy-MM-dd')
      const end = format(endOfMonth(new Date()), 'yyyy-MM-dd')

      const [resLancamentos, resDespesas] = await Promise.all([
        supabase
          .from('lancamentos_pacientes')
          .select('*')
          .gte('data_atendimento', start)
          .lte('data_atendimento', end),
        supabase
          .from('despesas')
          .select('*')
          .gte('data_vencimento', start)
          .lte('data_vencimento', end),
      ])

      setLancamentos(resLancamentos.data || [])
      setDespesas(resDespesas.data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const faturamentoTotal = lancamentos.reduce((acc, curr) => acc + Number(curr.valor), 0)
  const totalDespesas = despesas.reduce((acc, curr) => acc + Number(curr.valor), 0)
  const resultadoLiquido = faturamentoTotal - totalDespesas

  const consultas = lancamentos.filter((l) => l.tipo === 'Consulta')
  const faturamentoConsultas = consultas.reduce((acc, curr) => acc + Number(curr.valor), 0)
  const ticketConsultas = consultas.length > 0 ? faturamentoConsultas / consultas.length : 0

  const procedimentos = lancamentos.filter((l) => l.tipo === 'Procedimento')
  const faturamentoProcedimentos = procedimentos.reduce((acc, curr) => acc + Number(curr.valor), 0)
  const ticketProcedimentos =
    procedimentos.length > 0 ? faturamentoProcedimentos / procedimentos.length : 0

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(faturamentoTotal)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Total Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-destructive">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalDespesas)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Resultado Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-black ${resultadoLiquido >= 0 ? 'text-emerald-600' : 'text-destructive'}`}
            >
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(resultadoLiquido)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-secondary/10 pb-4">
            <CardTitle className="text-lg">Métricas de Consultas</CardTitle>
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
            <CardTitle className="text-lg">Métricas de Procedimentos</CardTitle>
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

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-secondary/10">
          <CardTitle>Entradas vs Saídas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
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
                    data={[
                      { name: 'Mês Atual', entradas: faturamentoTotal, saidas: totalDespesas },
                    ]}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis
                      tickFormatter={(val) => `R$${val / 1000}k`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          formatter={(val: any) => formatCurrency(Number(val))}
                        />
                      }
                      cursor={{ fill: 'var(--theme-ui-muted)' }}
                    />
                    <Bar
                      dataKey="entradas"
                      fill="var(--color-entradas)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={80}
                    />
                    <Bar
                      dataKey="saidas"
                      fill="var(--color-saidas)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={80}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
