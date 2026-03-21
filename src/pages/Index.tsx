import { useState } from 'react'
import {
  CalendarIcon,
  Download,
  X,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  LucideIcon,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useDashboardData } from '@/hooks/use-dashboard'

interface MetricCardProps {
  title: string
  icon: LucideIcon
  value: string | number
  subtitle: string
  loading?: boolean
}

function MetricCard({ title, icon: Icon, value, subtitle, loading }: MetricCardProps) {
  return (
    <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {title}
          </p>
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-10 w-32 mb-2" />
        ) : (
          <h3 className="text-4xl font-bold text-foreground mb-2">{value}</h3>
        )}
        <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

interface ChartCardProps {
  title: string
  data: any[]
  dataKey: string
  color: string
  formatter?: (val: number) => string
  loading?: boolean
}

function ChartCard({ title, data, dataKey, color, formatter, loading }: ChartCardProps) {
  return (
    <Card className="shadow-sm border-border/60 rounded-2xl bg-card flex flex-col">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 flex-1">
        <div className="h-[300px] w-full">
          {loading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : (
            <ChartContainer
              config={{ [dataKey]: { label: title, color } }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={formatter ? (val: any) => formatter(Number(val)) : undefined}
                      />
                    }
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  />
                  <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Index() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const { metrics, chartData, loading, error } = useDashboardData(date)

  const formatCurrency = (val: number | undefined | null) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val ?? 0)

  const formatPercent = (val: number | undefined | null) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(
      (val ?? 0) / 100,
    )

  return (
    <div className="p-6 md:p-10 animate-fade-in print:p-0">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Painel</h1>
          <p className="text-muted-foreground mt-2 text-lg">Visão geral do seu desempenho</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  'w-[280px] justify-start text-left font-normal rounded-full h-11 px-4',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 w-4 h-4" />
                {date?.from ? (
                  date.to && date.to.getTime() !== date.from.getTime() ? (
                    `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}`
                  ) : (
                    format(date.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDate({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
            className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Download className="w-4 h-4" /> Gerar PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-10 print:mb-6">
        <span className="text-sm font-medium text-muted-foreground print:hidden">
          Exibindo dados de:
        </span>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1.5 font-semibold border border-primary/20"
        >
          {date?.from
            ? date.to && date.to.getTime() !== date.from.getTime()
              ? `${format(date.from, 'dd/MM/yyyy')} até ${format(date.to, 'dd/MM/yyyy')}`
              : format(date.from, 'dd/MM/yyyy')
            : 'Período inválido'}
        </Badge>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-10 bg-destructive/5 text-destructive border-destructive/20 rounded-xl print:hidden"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold text-base">Aviso</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Faturamento Total"
            icon={DollarSign}
            value={formatCurrency(metrics.faturamentoTotal)}
            subtitle="Controle do período"
            loading={loading}
          />
          <MetricCard
            title="Total de Pacientes"
            icon={Users}
            value={metrics.totalPacientes ?? 0}
            subtitle="Pacientes únicos na base"
            loading={loading}
          />
          <MetricCard
            title="Bilheteria"
            icon={Target}
            value={formatCurrency(metrics.bilheteria)}
            subtitle="No período selecionado"
            loading={loading}
          />
          <MetricCard
            title="Margem de Lucro"
            icon={TrendingUp}
            value={formatPercent(metrics.margemLucro)}
            subtitle="Receitas vs Despesas"
            loading={loading}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 print:hidden">
          Evolução no Período
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
          <ChartCard
            title="Faturamento por dia"
            data={chartData.faturamento}
            dataKey="total"
            color="hsl(var(--primary))"
            formatter={(val: number) => formatCurrency(val)}
            loading={loading}
          />
          <ChartCard
            title="Consultas por dia"
            data={chartData.pacientes}
            dataKey="total"
            color="hsl(var(--primary))"
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
