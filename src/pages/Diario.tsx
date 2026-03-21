import { useState, useEffect, useCallback, useMemo } from 'react'
import { FileDown, TrendingUp, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getRegistros, deleteRegistro, RegistroDiario } from '@/services/registros_diarios'
import { RegistroFormDialog } from '@/components/diario/RegistroFormDialog'
import { EditRegistroDialog } from '@/components/diario/EditRegistroDialog'
import { MetasDialog, MetasDiarias } from '@/components/diario/MetasDialog'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { generatePDF } from '@/lib/utils'

export default function Diario() {
  const [registros, setRegistros] = useState<RegistroDiario[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [loading, setLoading] = useState(true)

  const [editRegistro, setEditRegistro] = useState<RegistroDiario | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [metas, setMetas] = useLocalStorage<MetasDiarias>('diario-metas', {
    faturamento: 5000,
    consultas: 20,
    servicos: 10,
    bilheteria: 1500,
  })

  const { toast } = useToast()

  const fetchRegistros = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getRegistros(dateRange?.from, dateRange?.to)
      setRegistros(data || [])
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os registros.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [dateRange, toast])

  useEffect(() => {
    fetchRegistros()
  }, [fetchRegistros])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro? A ação não pode ser desfeita.')) {
      try {
        await deleteRegistro(id)
        toast({ title: 'Sucesso', description: 'Registro excluído com sucesso.' })
        fetchRegistros()
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
      }
    }
  }

  const formatCurrency = (value: number | null) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const { totals, chartData } = useMemo(() => {
    const t = { faturamento: 0, consultas: 0, servicos: 0, bilheteria: 0 }
    const cData = []

    for (let i = registros.length - 1; i >= 0; i--) {
      const r = registros[i]
      t.faturamento += r.faturamento_total || 0
      t.consultas += r.total_consultas || 0
      t.servicos += r.total_servicos || 0
      t.bilheteria += r.bilheteria || 0

      cData.push({
        data: format(parseLocalDate(r.data), 'dd/MMM', { locale: ptBR }),
        faturamento: r.faturamento_total,
        consultas: r.total_consultas,
      })
    }

    return { totals: t, chartData: cData }
  }, [registros])

  const daysCount = registros.length || 1
  const targets = {
    faturamento: metas.faturamento * daysCount,
    consultas: metas.consultas * daysCount,
    servicos: metas.servicos * daysCount,
    bilheteria: metas.bilheteria * daysCount,
  }

  const progress = {
    faturamento: Math.min(100, (totals.faturamento / (targets.faturamento || 1)) * 100),
    consultas: Math.min(100, (totals.consultas / (targets.consultas || 1)) * 100),
    servicos: Math.min(100, (totals.servicos / (targets.servicos || 1)) * 100),
    bilheteria: Math.min(100, (totals.bilheteria / (targets.bilheteria || 1)) * 100),
  }

  const handlePrint = generatePDF

  return (
    <div className="p-6 md:p-10 animate-fade-in print:p-0 print:m-0">
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Relatório Diário - Clínica</h1>
        <p className="text-slate-600">
          Período: {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Todos'} até{' '}
          {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Todos'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Controle Diário de Metas
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe sua agenda e o atingimento de metas</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <MetasDialog metas={metas} setMetas={setMetas} />
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 md:flex-none h-10 px-4 gap-2 bg-white shadow-sm hover:bg-slate-50"
          >
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
          <RegistroFormDialog onSuccess={fetchRegistros} />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 mb-8 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row items-end gap-5">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Filtrar por Período
            </label>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          <Button
            variant="ghost"
            onClick={() => setDateRange(undefined)}
            className="w-full md:w-auto h-10 px-6 text-slate-600 hover:text-slate-900"
          >
            Limpar Filtro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:hidden">
        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress.faturamento}%` }}
            />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Faturamento Total
              </p>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {Math.round(progress.faturamento)}% da meta
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              {formatCurrency(totals.faturamento)}
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Meta: {formatCurrency(targets.faturamento)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress.consultas}%` }}
            />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Consultas
              </p>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {Math.round(progress.consultas)}% da meta
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{totals.consultas}</h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Meta: {targets.consultas} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-violet-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress.servicos}%` }}
            />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                SERVIÇOS
              </p>
              <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                {Math.round(progress.servicos)}% da meta
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{totals.servicos}</h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Meta: {targets.servicos} procedimentos
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress.bilheteria}%` }}
            />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Bilheteria
              </p>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {Math.round(progress.bilheteria)}% da meta
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              {formatCurrency(totals.bilheteria)}
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Meta: {formatCurrency(targets.bilheteria)}
            </p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className="shadow-sm border-slate-200/60 rounded-xl mb-8 p-6 print:hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Histórico de Performance</h3>
          <div className="h-[280px] w-full">
            <ChartContainer
              config={{
                faturamento: { label: 'Faturamento', color: '#3b82f6' },
                consultas: { label: 'Consultas', color: '#10b981' },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="data"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `R$${val / 1000}k`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="faturamento"
                    stroke="var(--color-faturamento)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-faturamento)' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="consultas"
                    stroke="var(--color-consultas)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-consultas)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      )}

      <Card className="shadow-sm border-slate-200/60 rounded-xl min-h-[400px] flex flex-col bg-white print:border-none print:shadow-none overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center print:p-0">
          <h2 className="text-lg font-bold text-slate-800">Lista de Registros</h2>
        </div>
        <div className="flex-1">
          {loading ? (
            <div className="p-6 space-y-4 print:hidden">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : registros.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-16 print:hidden">
              <TrendingUp className="w-16 h-16 text-slate-200 mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-slate-500">Comece adicionando ou ajuste o filtro de data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                    <TableHead className="text-right">Consultas</TableHead>
                    <TableHead className="text-right">Serviços</TableHead>
                    <TableHead className="text-right">Bilheteria</TableHead>
                    <TableHead className="w-[80px] print:hidden"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((r) => (
                    <TableRow key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {format(parseLocalDate(r.data), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-700">
                        {formatCurrency(r.faturamento_total)}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {r.total_consultas}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {r.total_servicos}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {formatCurrency(r.bilheteria)}
                      </TableCell>
                      <TableCell className="text-right print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditRegistro(r)
                                setEditDialogOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(r.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      <EditRegistroDialog
        registro={editRegistro}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchRegistros}
      />
    </div>
  )
}
