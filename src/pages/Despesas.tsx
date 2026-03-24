import { useState, useEffect } from 'react'
import { Receipt, Plus, Trash2, Edit, TrendingDown, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

import { CostDistributionChart } from '@/components/despesas/CostDistributionChart'
import { MonthlyComparisonChart } from '@/components/despesas/MonthlyComparisonChart'
import { BreakEvenProjection } from '@/components/despesas/BreakEvenProjection'
import { ContasAPagarTab } from '@/components/despesas/ContasAPagarTab'

interface Despesa {
  id: string
  data_vencimento: string
  descricao: string
  categoria: string
  valor: number
  status: string
}

const CATEGORIAS = ['Fixas', 'Variáveis', 'Pessoal', 'Impostos', 'Marketing']

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Form State
  const [editId, setEditId] = useState<string | null>(null)
  const [dataVencimento, setDataVencimento] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('Pendente')

  const { toast } = useToast()

  const fetchDespesas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('despesas')
      .select('id, data_vencimento, descricao, categoria, valor, status')
      .order('data_vencimento', { ascending: false })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as despesas.',
        variant: 'destructive',
      })
    } else {
      setDespesas((data as Despesa[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDespesas()
  }, [])

  const handleOpenNew = () => {
    setEditId(null)
    setDataVencimento(format(new Date(), 'yyyy-MM-dd'))
    setDescricao('')
    setCategoria('')
    setValor('')
    setStatus('Pendente')
    setOpen(true)
  }

  const handleOpenEdit = (despesa: Despesa) => {
    setEditId(despesa.id)
    setDataVencimento(despesa.data_vencimento || '')
    setDescricao(despesa.descricao || '')
    setCategoria(despesa.categoria || '')
    setValor(despesa.valor.toString())
    setStatus(despesa.status || 'Pendente')
    setOpen(true)
  }

  const handleSave = async () => {
    if (!dataVencimento || !descricao || !categoria || !valor) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }

    const payload = {
      data_vencimento: dataVencimento,
      descricao,
      categoria,
      valor: parseFloat(valor),
      status,
    }

    if (editId) {
      const { error } = await supabase.from('despesas').update(payload).eq('id', editId)
      if (error)
        toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Despesa/Conta atualizada com sucesso.' })
        fetchDespesas()
        setOpen(false)
      }
    } else {
      const { error } = await supabase.from('despesas').insert([payload])
      if (error)
        toast({ title: 'Erro', description: 'Falha ao cadastrar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Despesa/Conta cadastrada com sucesso.' })
        fetchDespesas()
        setOpen(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
    const { error } = await supabase.from('despesas').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Despesa excluída com sucesso.' })
      fetchDespesas()
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const totalDespesas = despesas.reduce((acc, curr) => acc + Number(curr.valor), 0)

  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary" />
            Despesas e Contas a Pagar
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Registre custos, despesas fixas e acompanhe seus vencimentos.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2 rounded-full shadow-sm">
          <Plus className="w-4 h-4" /> Nova Despesa
        </Button>
      </div>

      <Tabs defaultValue="lancamentos" className="w-full flex flex-col gap-6">
        <TabsList className="h-auto p-1.5 bg-secondary/40 rounded-2xl w-full sm:w-fit inline-flex flex-wrap shadow-sm border border-border/50">
          <TabsTrigger
            value="lancamentos"
            className="px-5 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
          >
            <TrendingDown className="w-4 h-4" />{' '}
            <span className="font-medium">Dashboard & Lançamentos</span>
          </TabsTrigger>
          <TabsTrigger
            value="calendario"
            className="px-5 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
          >
            <CalendarDays className="w-4 h-4" />{' '}
            <span className="font-medium">Contas a Pagar (Calendário)</span>
          </TabsTrigger>
        </TabsList>

        <div className="w-full">
          <TabsContent
            value="lancamentos"
            className="mt-0 outline-none space-y-8 animate-fade-in-up"
          >
            {/* DASHBOARD GM METRICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                  <div className="bg-destructive/10 p-4 rounded-full">
                    <TrendingDown className="w-8 h-8 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      Total Consolidado
                    </p>
                    <h3 className="text-4xl font-black text-foreground tracking-tight">
                      {formatCurrency(totalDespesas)}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CostDistributionChart despesas={despesas} />
                  <MonthlyComparisonChart despesas={despesas} />
                </div>
              </div>

              <div className="lg:col-span-1">
                <BreakEvenProjection totalDespesas={totalDespesas} />
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="p-6 border-b border-border/40 bg-secondary/10">
                <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest">
                  Lançamentos Recentes
                </h2>
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : despesas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-16">
                  <div className="bg-primary/5 p-6 rounded-full mb-6">
                    <Receipt className="w-16 h-16 text-primary/40" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Nenhuma despesa registrada
                  </h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-sm">
                    Comece a registrar seus custos para ter um Raio-X Financeiro mais preciso.
                  </p>
                  <Button onClick={handleOpenNew} variant="outline" className="gap-2 rounded-full">
                    <Plus className="w-4 h-4" /> Registrar Primeira Despesa
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto p-0">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-12 font-semibold">Data</TableHead>
                        <TableHead className="h-12 font-semibold">Descrição</TableHead>
                        <TableHead className="h-12 font-semibold">Categoria</TableHead>
                        <TableHead className="h-12 font-semibold">Status</TableHead>
                        <TableHead className="h-12 text-right font-semibold">Valor</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {despesas.map((d) => (
                        <TableRow
                          key={d.id}
                          className="group hover:bg-secondary/20 transition-colors"
                        >
                          <TableCell className="font-medium py-4 text-muted-foreground">
                            {d.data_vencimento
                              ? format(parseISO(d.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })
                              : '-'}
                          </TableCell>
                          <TableCell className="py-4 font-semibold">{d.descricao}</TableCell>
                          <TableCell className="py-4">
                            <span className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-md text-xs font-medium border border-border/50">
                              {d.categoria}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={d.status === 'Pago' ? 'default' : 'outline'}
                              className={
                                d.status === 'Pago'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none'
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none'
                              }
                            >
                              {d.status || 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-foreground py-4">
                            {formatCurrency(d.valor)}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(d)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(d.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendario" className="mt-0 outline-none w-full">
            <ContasAPagarTab
              despesas={despesas}
              onOpenNew={handleOpenNew}
              onEdit={handleOpenEdit}
            />
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Despesa' : 'Nova Despesa / Conta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Vencimento</Label>
                <Input
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  className="bg-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-secondary/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Aluguel, Internet..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-secondary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="bg-secondary/20">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="bg-secondary/20 font-medium"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full mt-4 rounded-full h-11">
              {editId ? 'Salvar Alterações' : 'Cadastrar Conta'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
