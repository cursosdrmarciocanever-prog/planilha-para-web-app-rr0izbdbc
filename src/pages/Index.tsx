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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useDashboardData } from '@/hooks/use-dashboard'

interface MetricCardProps {
  title: string
  icon: LucideIcon
  value: string | number
  subtitle: string
}

function MetricCard({ title, icon: Icon, value, subtitle }: MetricCardProps) {
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
        <h3 className="text-4xl font-bold text-foreground mb-2">{value}</h3>
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
}

function ChartCard({ title, data, dataKey, color, formatter }: ChartCardProps) {
  return (
    <Card className="shadow-sm border-border/60 rounded-2xl bg-card">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-[300px] w-full">
          <ChartContainer config={{ [dataKey]: { label: title, color } }} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
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

  const { metrics, chartData } = useDashboardData(date)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatPercent = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(val / 100)

  return (
    <div className="p-6 md:p-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
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
                  date.to ? (
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
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Gerar PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <span className="text-sm font-medium text-muted-foreground">Exibindo dados de:</span>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1.5 font-semibold border border-primary/20"
        >
          {date?.from && date?.to
            ? `${format(date.from, 'dd/MM/yyyy')} até ${format(date.to, 'dd/MM/yyyy')}`
            : 'Período inválido'}
        </Badge>
      </div>

      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Principais Indicadores
          </h2>
          <ToggleGroup
            type="single"
            defaultValue="todos"
            className="bg-card border border-border p-1 rounded-full shadow-sm"
          >
            <ToggleGroupItem
              value="todos"
              className="data-[state=on]:bg-secondary data-[state=on]:text-foreground rounded-full px-6 text-sm h-9 font-medium text-muted-foreground"
            >
              Todos
            </ToggleGroupItem>
            <ToggleGroupItem
              value="consultas"
              className="data-[state=on]:bg-secondary data-[state=on]:text-foreground rounded-full px-6 text-sm h-9 font-medium text-muted-foreground"
            >
              Consultas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Faturamento Total"
            icon={DollarSign}
            value={formatCurrency(metrics.faturamentoTotal)}
            subtitle="Controle do período"
          />
          <MetricCard
            title="Total de Pacientes"
            icon={Users}
            value={metrics.totalPacientes}
            subtitle="Pacientes cadastrados"
          />
          <MetricCard
            title="Bilheteria"
            icon={Target}
            value={formatCurrency(metrics.bilheteria)}
            subtitle="No período selecionado"
          />
          <MetricCard
            title="Margem de Lucro"
            icon={TrendingUp}
            value={formatPercent(metrics.margemLucro)}
            subtitle="Receitas vs Despesas"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
          Evolução no Período
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Faturamento por dia"
            data={chartData.faturamento}
            dataKey="total"
            color="hsl(var(--primary))"
            formatter={(val: number) => formatCurrency(val)}
          />
          <ChartCard
            title="Pacientes por dia"
            data={chartData.pacientes}
            dataKey="total"
            color="hsl(var(--primary))"
          />
        </div>
      </div>
    </div>
  )
}
