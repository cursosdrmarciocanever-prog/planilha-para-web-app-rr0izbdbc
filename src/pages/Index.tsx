import { useState, useEffect } from 'react'
import { format, addMonths, startOfMonth, isSameMonth, subMonths, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar as CalIcon,
  DollarSign,
  Activity,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Link } from 'react-router-dom'

export default function Index() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<any[]>([])
  const [kpis, setKpis] = useState({ revenue: 0, appointments: 0, expenses: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const startCurrentMonth = startOfMonth(today)
      const past12MonthsStr = format(startOfMonth(subMonths(today, 12)), 'yyyy-MM-dd')

      const [recRes, despRes, fixasRes, agendRes] = await Promise.all([
        supabase
          .from('transacoes')
          .select('valor, data')
          .eq('tipo', 'receita')
          .gte('data', past12MonthsStr),
        supabase
          .from('despesas')
          .select('valor, data_vencimento, parcelamento, status')
          .gte('data_vencimento', past12MonthsStr),
        supabase.from('contas_fixas').select('valor, status, data_vencimento, frequencia'),
        supabase
          .from('agendamentos')
          .select('id')
          .gte('data_hora', startCurrentMonth.toISOString()),
      ])

      let avgRev = 10000
      let currentRevenue = 0

      if (recRes.data && recRes.data.length > 0) {
        const past6MonthsData = recRes.data.filter(
          (r) =>
            new Date(`${r.data}T12:00:00`) < startCurrentMonth &&
            new Date(`${r.data}T12:00:00`) >= startOfMonth(subMonths(today, 6)),
        )
        if (past6MonthsData.length > 0) {
          const total = past6MonthsData.reduce((acc, c) => acc + Number(c.valor), 0)
          avgRev = Math.max(total / 6, 5000)
        } else {
          const totalAll = recRes.data.reduce((acc, c) => acc + Number(c.valor), 0)
          avgRev = Math.max(totalAll / 6, 5000)
        }

        currentRevenue = recRes.data
          .filter((r) => isSameMonth(new Date(`${r.data}T12:00:00`), today))
          .reduce((acc, c) => acc + Number(c.valor), 0)
      }

      const newAlerts = []
      const cData = []

      let currentExpenses = 0

      for (let i = 0; i < 4; i++) {
        const targetMonth = addMonths(startCurrentMonth, i)
        let monthTotal = 0

        despRes.data?.forEach((d) => {
          const st = d.data_vencimento ? new Date(`${d.data_vencimento}T12:00:00`) : new Date()
          if (d.parcelamento) {
            const parts = d.parcelamento.split('/')
            if (parts.length === 2) {
              const cur = parseInt(parts[0])
              const tot = parseInt(parts[1])
              for (let j = 0; j <= tot - cur; j++) {
                const parcelDate = addMonths(st, j)
                if (isSameMonth(parcelDate, targetMonth)) {
                  monthTotal += Number(d.valor)
                }
              }
            } else if (isSameMonth(st, targetMonth)) {
              monthTotal += Number(d.valor)
            }
          } else if (isSameMonth(st, targetMonth)) {
            monthTotal += Number(d.valor)
          }
        })

        fixasRes.data?.forEach((f) => {
          if (f.status === 'Inativo' || f.status === 'Cancelado') return

          const st = f.data_vencimento ? new Date(`${f.data_vencimento}T12:00:00`) : new Date()

          if (f.frequencia === 'Única') {
            if (isSameMonth(st, targetMonth)) {
              monthTotal += Number(f.valor)
            }
          } else if (f.frequencia === 'Anual') {
            if (st.getMonth() === targetMonth.getMonth() && st <= endOfMonth(targetMonth)) {
              monthTotal += Number(f.valor)
            }
          } else if (f.frequencia === 'Semestral') {
            const diffMonths =
              (targetMonth.getFullYear() - st.getFullYear()) * 12 +
              targetMonth.getMonth() -
              st.getMonth()
            if (diffMonths >= 0 && diffMonths % 6 === 0) {
              monthTotal += Number(f.valor)
            }
          } else if (f.frequencia === 'Trimestral') {
            const diffMonths =
              (targetMonth.getFullYear() - st.getFullYear()) * 12 +
              targetMonth.getMonth() -
              st.getMonth()
            if (diffMonths >= 0 && diffMonths % 3 === 0) {
              monthTotal += Number(f.valor)
            }
          } else if (f.frequencia === 'Bimestral') {
            const diffMonths =
              (targetMonth.getFullYear() - st.getFullYear()) * 12 +
              targetMonth.getMonth() -
              st.getMonth()
            if (diffMonths >= 0 && diffMonths % 2 === 0) {
              monthTotal += Number(f.valor)
            }
          } else {
            if (st <= endOfMonth(targetMonth)) {
              monthTotal += Number(f.valor)
            }
          }
        })

        if (i === 0) currentExpenses = monthTotal

        if (monthTotal > avgRev && i > 0) {
          newAlerts.push({
            month: targetMonth,
            total: monthTotal,
            limit: avgRev,
          })
        }

        cData.push({
          name: format(targetMonth, 'MMM', { locale: ptBR }).toUpperCase(),
          Projetado: monthTotal,
          Limite: avgRev,
        })
      }

      setAlerts(newAlerts)
      setChartData(cData)
      setKpis({
        revenue: currentRevenue || avgRev,
        appointments: agendRes.data?.length || 0,
        expenses: currentExpenses,
      })
    } catch (err) {
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      title: 'Faturamento Estimado',
      value: `R$ ${kpis.revenue.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Despesas Projetadas (Mês)',
      value: `R$ ${kpis.expenses.toFixed(2).replace('.', ',')}`,
      icon: CreditCard,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'Agendamentos (Mês)',
      value: kpis.appointments.toString(),
      icon: CalIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Saúde Financeira',
      value: kpis.revenue > kpis.expenses ? 'Positiva' : 'Atenção',
      icon: Activity,
      color: kpis.revenue > kpis.expenses ? 'text-emerald-600' : 'text-amber-600',
      bg:
        kpis.revenue > kpis.expenses
          ? 'bg-emerald-100 dark:bg-emerald-900/30'
          : 'bg-amber-100 dark:bg-amber-900/30',
    },
  ]

  if (loading) {
    return (
      <div className="p-6 md:p-10 animate-fade-in max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Resumo</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do seu planejamento e saúde financeira.
          </p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
          {alerts.map((al, idx) => (
            <Alert
              key={idx}
              variant="destructive"
              className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 shadow-sm border-l-4 border-l-red-600"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300 font-bold text-base">
                Alerta de Risco Financeiro: {format(al.month, 'MMMM/yyyy', { locale: ptBR })}
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400 text-sm mt-1 leading-relaxed">
                O sistema identificou que o comprometimento projetado para este mês (
                <strong>R$ {al.total.toFixed(2).replace('.', ',')}</strong>) ultrapassou o seu
                faturamento médio atual (<strong>R$ {al.limit.toFixed(2).replace('.', ',')}</strong>
                ). Recomendamos revisar novas compras e parcelamentos para evitar déficit de caixa.
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card
            key={index}
            className="border-border/60 shadow-sm rounded-2xl bg-card hover:shadow-md transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardHeader>
            <CardTitle>Projeção de Comprometimento (Próximos Meses)</CardTitle>
            <CardDescription>
              Comparativo entre Despesas Projetadas e Limite Seguro (Faturamento Médio)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  Projetado: { color: 'hsl(var(--destructive))' },
                  Limite: { color: 'hsl(var(--primary))' },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="Projetado"
                      fill="var(--color-Projetado)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                    <Bar
                      dataKey="Limite"
                      fill="var(--color-Limite)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum dado projetado
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Atalhos para as principais áreas de gestão do sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link
              to="/despesas"
              className="group p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold text-sm">Calendário de Contas</span>
            </Link>
            <Link
              to="/faturamento"
              className="group p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="p-3 bg-green-500/10 rounded-full group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-semibold text-sm">Lançar Faturamento</span>
            </Link>
            <Link
              to="/importar"
              className="group p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="p-3 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold text-sm">Importar Planilhas</span>
            </Link>
            <Link
              to="/diario"
              className="group p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="p-3 bg-amber-500/10 rounded-full group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <span className="font-semibold text-sm">Diário de Atendimentos</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
