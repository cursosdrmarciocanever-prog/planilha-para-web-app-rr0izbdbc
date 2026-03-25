import { useState, useEffect, useCallback, useMemo } from 'react'
import { FileDown, Trash2, ArrowRightLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { generatePDF } from '@/lib/utils'
import {
  getDiarioAtendimentos,
  deleteDiarioAtendimento,
  DiarioAtendimento,
} from '@/services/diario_atendimentos'
import { NovoAtendimentoDialog } from '@/components/diario/NovoAtendimentoDialog'
import { Link } from 'react-router-dom'

type MetricColor = 'blue' | 'emerald' | 'violet' | 'amber'

function MetricCard({
  title,
  value,
  color,
  variant = 'primary',
}: {
  title: string
  value: string | number
  color: MetricColor
  variant?: 'primary' | 'secondary'
}) {
  const bgColors: Record<MetricColor, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  }
  const textColors: Record<MetricColor, string> = {
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
    violet: 'text-violet-700',
    amber: 'text-amber-700',
  }

  return (
    <Card className="shadow-sm border-slate-200/60 rounded-xl relative overflow-hidden bg-white">
      <div className={`absolute inset-x-0 bottom-0 h-1.5 ${bgColors[color]} opacity-80`} />
      <CardContent className="p-5">
        <p
          className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 line-clamp-1"
          title={title}
        >
          {title}
        </p>
        <h3
          className={`text-2xl font-bold truncate ${variant === 'primary' ? 'text-slate-900' : textColors[color]}`}
        >
          {value}
        </h3>
      </CardContent>
    </Card>
  )
}

export default function Diario() {
  const [registros, setRegistros] = useState<DiarioAtendimento[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState('Todos')
  const [tipoServicoFiltro, setTipoServicoFiltro] = useState('Todos')
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  const fetchRegistros = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDiarioAtendimentos(
        dateRange?.from,
        dateRange?.to,
        formaPagamentoFiltro,
        tipoServicoFiltro,
      )
      setRegistros(data || [])
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os registros de atendimento.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [dateRange, formaPagamentoFiltro, tipoServicoFiltro, toast])

  useEffect(() => {
    fetchRegistros()
  }, [fetchRegistros])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este atendimento? A ação não pode ser desfeita.')) {
      try {
        await deleteDiarioAtendimento(id)
        toast({ title: 'Sucesso', description: 'Atendimento excluído com sucesso.' })
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

  const totals = useMemo(() => {
    let faturamentoConsultas = 0
    let faturamentoProcedimentos = 0
    let qtdConsultas = 0
    let qtdProcedimentos = 0
    const qtdAtendimentos = registros.length

    registros.forEach((r) => {
      faturamentoConsultas += r.valor_consulta || 0
      faturamentoProcedimentos += r.valor_procedimento || 0
      if (r.valor_consulta > 0) qtdConsultas++
      if (r.valor_procedimento > 0) qtdProcedimentos++
    })

    const faturamentoTotal = faturamentoConsultas + faturamentoProcedimentos

    return {
      faturamentoTotal,
      faturamentoConsultas,
      faturamentoProcedimentos,
      qtdConsultas,
      qtdProcedimentos,
      tmGeral: qtdAtendimentos > 0 ? faturamentoTotal / qtdAtendimentos : 0,
      tmConsultas: qtdConsultas > 0 ? faturamentoConsultas / qtdConsultas : 0,
      tmProcedimentos: qtdProcedimentos > 0 ? faturamentoProcedimentos / qtdProcedimentos : 0,
    }
  }, [registros])

  const handlePrint = () => generatePDF('simples')

  return (
    <div className="p-6 md:p-10 animate-fade-in print:p-0 print:m-0">
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Relatório de Atendimentos - Diário
        </h1>
        <div className="flex gap-6 text-sm text-slate-600 border-b border-slate-200 pb-4">
          <p>
            <strong>Período:</strong>{' '}
            {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Todos'} até{' '}
            {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Todos'}
          </p>
          <p>
            <strong>Pagamento:</strong> {formaPagamentoFiltro}
          </p>
          <p>
            <strong>Serviço:</strong> {tipoServicoFiltro}
          </p>
        </div>
      </div>

      <Tabs defaultValue="entradas" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Diário de Caixa</h1>
            <p className="text-slate-500 mt-1">
              Gestão detalhada de entradas e controle financeiro
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 md:flex-none h-10 px-4"
            >
              <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
            </Button>
            <NovoAtendimentoDialog onSuccess={fetchRegistros} />
          </div>
        </div>

        <TabsList className="mb-6 print:hidden bg-white shadow-sm border border-slate-200">
          <TabsTrigger value="entradas" className="px-6 data-[state=active]:bg-slate-100">
            Entradas (Atendimentos)
          </TabsTrigger>
          <TabsTrigger value="saidas" className="px-6 data-[state=active]:bg-slate-100">
            Saídas (Despesas)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entradas" className="mt-0 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 print:hidden shadow-sm">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">
                Filtro por Período
              </label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full" />
            </div>
            <div className="w-full md:w-48">
              <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">
                Forma de Pagamento
              </label>
              <Select value={formaPagamentoFiltro} onValueChange={setFormaPagamentoFiltro}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">
                Tipo de Serviço
              </label>
              <Select value={tipoServicoFiltro} onValueChange={setTipoServicoFiltro}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Consulta">Consultas</SelectItem>
                  <SelectItem value="Procedimento">Procedimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setDateRange(undefined)
                  setFormaPagamentoFiltro('Todos')
                  setTipoServicoFiltro('Todos')
                }}
                className="h-10 px-4 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            <MetricCard
              title="Faturamento Total"
              value={formatCurrency(totals.faturamentoTotal)}
              color="blue"
            />
            <MetricCard
              title="Fatur. Consultas"
              value={formatCurrency(totals.faturamentoConsultas)}
              color="emerald"
            />
            <MetricCard
              title="Fatur. Procedimentos"
              value={formatCurrency(totals.faturamentoProcedimentos)}
              color="violet"
            />
            <MetricCard
              title="Ticket Médio Geral"
              value={formatCurrency(totals.tmGeral)}
              color="amber"
            />
            <MetricCard
              title="Nº Consultas"
              value={totals.qtdConsultas}
              color="emerald"
              variant="secondary"
            />
            <MetricCard
              title="Nº Procedimentos"
              value={totals.qtdProcedimentos}
              color="violet"
              variant="secondary"
            />
            <MetricCard
              title="TM Consultas"
              value={formatCurrency(totals.tmConsultas)}
              color="emerald"
              variant="secondary"
            />
            <MetricCard
              title="TM Procedimentos"
              value={formatCurrency(totals.tmProcedimentos)}
              color="violet"
              variant="secondary"
            />
          </div>

          <Card className="shadow-sm border-slate-200/60 rounded-xl overflow-hidden bg-white print:border-none print:shadow-none">
            <div className="p-5 border-b border-slate-100 print:hidden">
              <h2 className="text-lg font-bold text-slate-800">Lista de Atendimentos</h2>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="p-6 space-y-4 print:hidden">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : registros.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-12 pb-16 print:hidden text-center">
                  <ArrowRightLeft className="w-12 h-12 text-slate-200 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">
                    Nenhum atendimento registrado
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    Cadastre um novo paciente ou ajuste os filtros para visualizar os dados de
                    entrada.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-slate-200">
                      <TableHead className="font-semibold text-slate-700">Data</TableHead>
                      <TableHead className="font-semibold text-slate-700">Paciente</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Consulta
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Procedimento
                      </TableHead>
                      <TableHead className="text-right font-bold text-slate-800">Total</TableHead>
                      <TableHead className="font-semibold text-slate-700">Pagamento</TableHead>
                      <TableHead className="w-[60px] print:hidden"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registros.map((r) => (
                      <TableRow key={r.id} className="group hover:bg-slate-50/60 transition-colors">
                        <TableCell className="font-medium text-slate-900">
                          {format(parseLocalDate(r.data), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">
                          {r.paciente_nome}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {r.valor_consulta > 0 ? formatCurrency(r.valor_consulta) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {r.valor_procedimento > 0 ? formatCurrency(r.valor_procedimento) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900 bg-slate-50/30">
                          {formatCurrency((r.valor_consulta || 0) + (r.valor_procedimento || 0))}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wide">
                            {r.forma_pagamento}
                          </span>
                        </TableCell>
                        <TableCell className="text-right print:hidden p-2">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(r.id)}
                              className="text-slate-400 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="saidas" className="mt-0">
          <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <ArrowRightLeft className="w-16 h-16 text-slate-200 mb-6" strokeWidth={1.5} />
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Controle de Saídas</h3>
            <p className="text-slate-500 mb-8 max-w-md leading-relaxed">
              Para maior precisão e organização, o gerenciamento de contas, despesas fixas e
              variáveis foi unificado em uma aba dedicada.
            </p>
            <Link to="/despesas">
              <Button size="lg" className="px-8 rounded-full shadow-md">
                Acessar Aba de Despesas
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
