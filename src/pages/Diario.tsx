import { useState, useEffect, useCallback } from 'react'
import { FileDown, TrendingUp } from 'lucide-react'
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
import { getRegistros, RegistroDiario } from '@/services/registros_diarios'
import { RegistroFormDialog } from '@/components/diario/RegistroFormDialog'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function Diario() {
  const [registros, setRegistros] = useState<RegistroDiario[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [loading, setLoading] = useState(true)
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

  const formatCurrency = (value: number | null) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const totals = registros.reduce(
    (acc, r) => ({
      faturamento: acc.faturamento + (r.faturamento_total || 0),
      consultas: acc.consultas + (r.total_consultas || 0),
      servicos: acc.servicos + (r.total_servicos || 0),
      bilheteria: acc.bilheteria + (r.bilheteria || 0),
    }),
    { faturamento: 0, consultas: 0, servicos: 0, bilheteria: 0 },
  )

  const handlePrint = () => window.print()

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
          <p className="text-slate-500 mt-1">Acompanhe sua agenda e pacientes diários</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={handlePrint}
            className="flex-1 md:flex-none bg-[#a5dbb7] hover:bg-[#88c99e] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4"
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
            variant="outline"
            onClick={() => setDateRange(undefined)}
            className="w-full md:w-auto h-10 px-6"
          >
            Limpar Filtro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:hidden">
        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Faturamento Total
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              {formatCurrency(totals.faturamento)}
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">Consultas + procedimentos</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Consultas
            </p>
            <h3 className="text-[22px] font-bold text-slate-900 mb-2">
              {totals.consultas} atendimentos
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">Total de pacientes atendidos</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              SERVIÇOS
            </p>
            <h3 className="text-[22px] font-bold text-slate-900 mb-2">
              {totals.servicos} procedimentos
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Procedimentos realizados e receita gerada
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Bilheteria
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              {formatCurrency(totals.bilheteria)}
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">Receita direta no período</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200/60 rounded-xl min-h-[400px] flex flex-col bg-white print:border-none print:shadow-none">
        <div className="p-6 pb-2 print:p-0 print:pb-4">
          <h2 className="text-lg font-bold text-slate-800">Registros Diários</h2>
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
              <TrendingUp className="w-16 h-16 text-slate-300 mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-slate-500">Comece adicionando ou ajuste o filtro de data</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">Consultas</TableHead>
                  <TableHead className="text-right">Serviços</TableHead>
                  <TableHead className="text-right">Bilheteria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {format(parseLocalDate(r.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(r.faturamento_total)}
                    </TableCell>
                    <TableCell className="text-right">{r.total_consultas}</TableCell>
                    <TableCell className="text-right">{r.total_servicos}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.bilheteria)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  )
}
