import { useState, useEffect, useCallback } from 'react'
import { Plus, Download, FileDown, Search, Trash2, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO, endOfMonth } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { WhatsAppNotification } from '../WhatsAppNotification'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function FaturamentoEntradas() {
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filtroMes, setFiltroMes] = useState(format(new Date(), 'yyyy-MM'))
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [buscaNome, setBuscaNome] = useState('')

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    let query = supabase
      .from('lancamentos_pacientes')
      .select('*')
      .order('data_atendimento', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (filtroMes) {
      const [ano, mes] = filtroMes.split('-')
      const dateObj = new Date(Number(ano), Number(mes) - 1, 1)
      const start = format(dateObj, 'yyyy-MM-dd')
      const end = format(endOfMonth(dateObj), 'yyyy-MM-dd')
      query = query.gte('data_atendimento', start).lte('data_atendimento', end)
    }

    if (filtroTipo !== 'Todos') {
      // Matches categories "Consultas" and "Procedimentos" roughly
      query = query.ilike('categoria', `%${filtroTipo}%`)
    }

    if (buscaNome) {
      query = query.ilike('nome_paciente', `%${buscaNome}%`)
    }

    const { data } = await query

    let filteredData = data || []
    if (filtroStatus === 'Pendente') {
      filteredData = []
    }

    setLancamentos(filteredData)
    setLoading(false)
  }, [filtroMes, filtroTipo, filtroStatus, buscaNome])

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel('faturamento_entradas_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lancamentos_pacientes' },
        () => {
          loadData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este lançamento?')) return
    const { error } = await supabase.from('lancamentos_pacientes').delete().eq('id', id)
    if (error) toast({ title: 'Erro ao excluir', variant: 'destructive' })
    else {
      toast({ title: 'Excluído com sucesso' })
      loadData()
    }
  }

  const getValorTotal = (l: any) => Number(l.valor || 0)

  const getTipoLabel = (l: any) => {
    return l.categoria || l.tipo || 'Outro'
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const totalValor = lancamentos.reduce((acc, curr) => acc + getValorTotal(curr), 0)
  const ticketMedio = lancamentos.length > 0 ? totalValor / lancamentos.length : 0

  const exportCSV = () => {
    let csv = 'Data,Paciente,Tipo,Valor,Forma de Pagamento,Conta Recebimento,Status\n'
    lancamentos.forEach((l) => {
      const tipo = getTipoLabel(l)
      const valor = getValorTotal(l)
      const pagamento =
        l.forma_pagamento === 'Cartão de Crédito Parcelado' && l.parcelas
          ? `${l.forma_pagamento} ${l.parcelas}x`
          : l.forma_pagamento
      csv += `${l.data_atendimento},"${l.nome_paciente}",${tipo},${valor},${pagamento},"${l.conta_recebimento || ''}","Confirmado"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `entradas_${filtroMes}.csv`
    link.click()
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()

    doc.setFontSize(14)
    doc.text('Clínica Canever Financeiro - Relatório de Entradas', pageW / 2, 15, {
      align: 'center',
    })

    doc.setFontSize(10)
    doc.text(
      `Período: ${filtroMes ? filtroMes : 'Todos'} | Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      14,
      25,
    )

    let finalY = 35
    const head = [['Data', 'Paciente', 'Tipo', 'Valor', 'Pgto', 'Conta', 'Status']]

    autoTable(doc, {
      startY: finalY + 5,
      head,
      body: lancamentos.map((c) => [
        format(parseISO(c.data_atendimento || new Date().toISOString()), 'dd/MM/yyyy'),
        c.nome_paciente,
        getTipoLabel(c),
        formatCurrency(getValorTotal(c)),
        c.forma_pagamento === 'Cartão de Crédito Parcelado' && c.parcelas
          ? `Parcelado ${c.parcelas}x`
          : c.forma_pagamento,
        c.conta_recebimento || '-',
        'Confirmado',
      ]),
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
    })
    finalY = (doc as any).lastAutoTable.finalY + 15

    doc.setFontSize(11)
    doc.text('Resumo do Período', 14, finalY)
    doc.setFontSize(10)
    doc.text(`Total de registros: ${lancamentos.length}`, 14, finalY + 7)
    doc.text(`Valor total: ${formatCurrency(totalValor)}`, 14, finalY + 14)
    doc.text(`Ticket médio: ${formatCurrency(ticketMedio)}`, 14, finalY + 21)

    doc.save(`relatorio_entradas_${filtroMes || 'todos'}.pdf`)
  }

  // Função para enviar notificação de faturamento via WhatsApp
  const handleSendWhatsAppNotification = (lancamento: any) => {
    const mensagem = `Faturamento registrado!\nPaciente: ${lancamento.nome_paciente}\nValor: R$ ${formatCurrency(getValorTotal(lancamento))}\nData: ${format(parseISO(lancamento.data_atendimento || new Date().toISOString()), 'dd/MM/yyyy')}\n\nClínica Canever`
    return mensagem
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-4 items-end bg-card p-5 rounded-2xl border border-border/60 shadow-sm print:hidden">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Período (Mês/Ano)
          </label>
          <Input
            type="month"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="h-11 rounded-xl bg-secondary/30"
          />
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Tipo
          </label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="h-11 rounded-xl bg-secondary/30">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Consulta">Consulta</SelectItem>
              <SelectItem value="Procedimento">Procedimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Status
          </label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="h-11 rounded-xl bg-secondary/30">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Confirmado">Confirmado</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Buscar Paciente
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
            <Input
              className="pl-10 h-11 rounded-xl bg-secondary/30"
              placeholder="Nome..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
          <Button
            variant="outline"
            onClick={exportCSV}
            className="h-11 px-4 rounded-xl"
            title="Exportar CSV"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={exportPDF}
            className="h-11 px-4 rounded-xl"
            title="Exportar PDF"
          >
            <FileDown className="w-4 h-4" />
          </Button>
          <Button asChild className="h-11 px-6 rounded-xl gap-2 shadow-sm">
            <Link to="/diario">
              <Plus className="w-4 h-4" /> Ir para o Diário
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-primary/80 uppercase tracking-widest mb-1">
              Total de Registros
            </p>
            <p className="text-3xl font-black text-primary">{lancamentos.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-emerald-700/80 uppercase tracking-widest mb-1">
              Valor Total
            </p>
            <p className="text-3xl font-black text-emerald-600">{formatCurrency(totalValor)}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20 shadow-sm border-border/50">
          <CardContent className="p-5 flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Ticket Médio
            </p>
            <p className="text-3xl font-black text-foreground">{formatCurrency(ticketMedio)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden print:border-none print:shadow-none">
        <div className="p-5 border-b border-border/40 bg-secondary/10 print:hidden">
          <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest">
            Histórico de Lançamentos
          </h2>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold h-12">Data</TableHead>
                <TableHead className="font-semibold h-12">Paciente</TableHead>
                <TableHead className="font-semibold h-12">Tipo</TableHead>
                <TableHead className="text-right font-semibold h-12">Valor</TableHead>
                <TableHead className="font-semibold h-12">Pagamento</TableHead>
                <TableHead className="font-semibold h-12">Conta Recebimento</TableHead>
                <TableHead className="font-semibold h-12">Status</TableHead>
                <TableHead className="w-[100px] print:hidden"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : lancamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Nenhum lançamento encontrado para os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                lancamentos.map((l) => {
                  const tipo = getTipoLabel(l)
                  const valorTotal = getValorTotal(l)
                  const pagamento =
                    l.forma_pagamento === 'Cartão de Crédito Parcelado' && l.parcelas
                      ? `${l.forma_pagamento} ${l.parcelas}x`
                      : l.forma_pagamento

                  return (
                    <TableRow key={l.id} className="group hover:bg-secondary/10 transition-colors">
                      <TableCell className="text-muted-foreground font-medium whitespace-nowrap">
                        {l.data_atendimento
                          ? format(parseISO(l.data_atendimento), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{l.nome_paciente}</TableCell>
                      <TableCell>
                        <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">
                          {tipo}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        {formatCurrency(valorTotal)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {pagamento}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-muted-foreground">
                          {l.conta_recebimento || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                          Confirmado
                        </Badge>
                      </TableCell>
                      <TableCell className="print:hidden">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <WhatsAppNotification
                            defaultMessage={handleSendWhatsAppNotification(l)}
                            buttonVariant="ghost"
                            buttonSize="icon"
                            buttonText=""
                            instanceName="clinica-canever"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                            onClick={() => handleDelete(l.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
