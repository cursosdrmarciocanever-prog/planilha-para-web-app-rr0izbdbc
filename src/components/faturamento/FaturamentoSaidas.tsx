import { useState, useEffect, useCallback } from 'react'
import { Download, Trash2, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO, endOfMonth } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export function FaturamentoSaidas() {
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filtroMes, setFiltroMes] = useState(format(new Date(), 'yyyy-MM'))
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('despesas').select('*').order('data_vencimento', { ascending: false })

    if (filtroMes) {
      const [ano, mes] = filtroMes.split('-')
      const dateObj = new Date(Number(ano), Number(mes) - 1, 1)
      const start = format(dateObj, 'yyyy-MM-dd')
      const end = format(endOfMonth(dateObj), 'yyyy-MM-dd')
      query = query.gte('data_vencimento', start).lte('data_vencimento', end)
    }

    const { data } = await query
    setDespesas(data || [])
    setLoading(false)
  }, [filtroMes])

  useEffect(() => {
    setSelectedIds([])
    loadData()

    const channel = supabase
      .channel('faturamento_saidas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const exportCSV = () => {
    let csv = 'Data,Descrição,Categoria,Valor,Status\n'
    despesas.forEach((d) => {
      csv += `${d.data_vencimento},"${d.descricao || ''}","${d.categoria || ''}",${d.valor},${d.status || ''}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `saidas_${filtroMes}.csv`
    link.click()
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta despesa?')) return
    const { error } = await supabase.from('despesas').delete().eq('id', id)
    if (error) toast({ title: 'Erro ao excluir', variant: 'destructive' })
    else {
      toast({ title: 'Excluído com sucesso' })
      loadData()
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Deseja excluir ${selectedIds.length} despesas selecionadas?`)) return
    const { error } = await supabase.from('despesas').delete().in('id', selectedIds)
    if (error) toast({ title: 'Erro ao excluir', variant: 'destructive' })
    else {
      toast({ title: `${selectedIds.length} despesas excluídas com sucesso` })
      setSelectedIds([])
      loadData()
    }
  }

  const handleUpdateStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase.from('despesas').update({ status: novoStatus }).eq('id', id)
    if (error) toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    else {
      toast({ title: 'Status atualizado com sucesso' })
      loadData()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex gap-4 items-end bg-card p-5 rounded-2xl border border-border/60 shadow-sm">
        <div className="flex-1 w-full max-w-sm space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Mês/Ano
          </label>
          <Input
            type="month"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="h-11 rounded-xl bg-secondary/30"
          />
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="h-11 px-4 rounded-xl shadow-sm"
              title="Excluir Selecionados"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Excluir ({selectedIds.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={exportCSV}
            className="h-11 px-6 rounded-xl gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border/40 bg-secondary/10 print:hidden">
          <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest">
            Despesas Operacionais e Custos
          </h2>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] print:hidden">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-primary"
                    checked={despesas.length > 0 && selectedIds.length === despesas.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(despesas.map((d) => d.id))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="font-semibold h-12">Data</TableHead>
                <TableHead className="font-semibold h-12">Descrição</TableHead>
                <TableHead className="font-semibold h-12">Categoria</TableHead>
                <TableHead className="font-semibold h-12">Status</TableHead>
                <TableHead className="text-right font-semibold h-12">Valor</TableHead>
                <TableHead className="w-[60px] print:hidden"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : despesas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhuma despesa encontrada no período.
                  </TableCell>
                </TableRow>
              ) : (
                despesas.map((d) => (
                  <TableRow key={d.id} className="group hover:bg-secondary/10 transition-colors">
                    <TableCell className="print:hidden">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-primary"
                        checked={selectedIds.includes(d.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, d.id])
                          } else {
                            setSelectedIds(selectedIds.filter((id) => id !== d.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {d.data_vencimento ? format(parseISO(d.data_vencimento), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="font-bold">{d.descricao}</TableCell>
                    <TableCell>
                      <span className="bg-secondary px-2.5 py-1 rounded-md text-xs font-medium">
                        {d.categoria}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none outline-none">
                          <Badge
                            variant={d.status === 'Pago' ? 'default' : 'outline'}
                            className={
                              d.status === 'Pago'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none cursor-pointer transition-colors'
                                : 'border-border/60 bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors'
                            }
                          >
                            {d.status || 'Pendente'}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(d.id, 'Pago')}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Marcar como Pago
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(d.id, 'Pendente')}
                            className="cursor-pointer"
                          >
                            <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                            Marcar como Pendente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      {formatCurrency(d.valor)}
                    </TableCell>
                    <TableCell className="print:hidden">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                          onClick={() => handleDelete(d.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
