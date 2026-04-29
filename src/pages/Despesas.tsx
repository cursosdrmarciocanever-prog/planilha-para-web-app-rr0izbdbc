import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Receipt,
  Plus,
  Trash2,
  Edit,
  TrendingDown,
  CalendarDays,
  CreditCard,
  Upload,
  Building2,
  Landmark,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { format, parseISO, addMonths, setDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

import { CostDistributionChart } from '@/components/despesas/CostDistributionChart'
import { MonthlyComparisonChart } from '@/components/despesas/MonthlyComparisonChart'
import { BreakEvenProjection } from '@/components/despesas/BreakEvenProjection'
import { ContasAPagarTab } from '@/components/despesas/ContasAPagarTab'

interface Despesa {
  id: string
  data_vencimento: string
  descricao: string
  categoria: string
  subcategoria?: string
  valor: number
  status: string
  conta_pagamento?: string
}

const CATEGORIAS = ['Fixas', 'Variáveis', 'Pessoal', 'Impostos', 'Marketing']

export default function Despesas() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('lancamentos')
  const [todasDespesas, setTodasDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Filtro de Contas
  const [activeContaFilter, setActiveContaFilter] = useState<
    'all' | 'Unicred' | 'Sicoob' | 'ESPÉCIE'
  >('all')

  // Subcategorias
  const [subcategorias, setSubcategorias] = useState<{ id: string; nome: string }[]>([])
  const [subcategoria, setSubcategoria] = useState('none')
  const [novaSubcategoria, setNovaSubcategoria] = useState('')
  const [isCreatingSubcategoria, setIsCreatingSubcategoria] = useState(false)

  // Form State
  const [editId, setEditId] = useState<string | null>(null)
  const [editType, setEditType] = useState<'despesa' | 'conta_fixa'>('despesa')
  const [dataVencimento, setDataVencimento] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('Pendente')
  const [contaPagamento, setContaPagamento] = useState('Unicred')

  // Novos estados para recorrência
  const [recorrencia, setRecorrencia] = useState('Única')
  const [parcelas, setParcelas] = useState('2')

  // Bulk Edit State
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('none')
  const [bulkDate, setBulkDate] = useState('')

  const { toast } = useToast()

  const fetchDados = async () => {
    setLoading(true)
    const [despesasRes, contasRes, subRes] = await Promise.all([
      supabase.from('despesas').select('*').order('data_vencimento', { ascending: false }),
      supabase.from('contas_fixas').select('*').order('data_vencimento', { ascending: false }),
      supabase
        .from('subcategorias_despesas' as any)
        .select('*')
        .order('nome', { ascending: true }),
    ])

    const d = (despesasRes.data || []).map((x) => ({ ...x, _table: 'despesa' }))
    const c = (contasRes.data || []).map((x) => ({ ...x, _table: 'conta_fixa' }))

    const filteredD = user ? d.filter((x) => !x.user_id || x.user_id === user.id) : d
    const filteredC = user ? c.filter((x) => !x.usuario_id || x.usuario_id === user.id) : c

    const combined = [...filteredD, ...filteredC].sort((a, b) => {
      const dateA = new Date(a.data_vencimento || 0).getTime()
      const dateB = new Date(b.data_vencimento || 0).getTime()
      return dateB - dateA
    })

    setTodasDespesas(combined)
    setSubcategorias(subRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchDados()
  }, [])

  // Regra automática de data de vencimento com base na conta/cartão selecionada
  useEffect(() => {
    if (!open) return
    if (contaPagamento === 'Cartão de Crédito Unicred') {
      if (dataVencimento) {
        const d = parseISO(dataVencimento)
        setDataVencimento(format(setDate(d, 10), 'yyyy-MM-dd'))
      } else {
        setDataVencimento(format(setDate(new Date(), 10), 'yyyy-MM-dd'))
      }
    } else if (contaPagamento === 'Cartão de Crédito Sicoob') {
      if (dataVencimento) {
        const d = parseISO(dataVencimento)
        setDataVencimento(format(setDate(d, 19), 'yyyy-MM-dd'))
      } else {
        setDataVencimento(format(setDate(new Date(), 19), 'yyyy-MM-dd'))
      }
    }
  }, [contaPagamento, open])

  const handleOpenNew = () => {
    const isContaFixa = activeTab === 'calendario'
    setEditId(null)
    setEditType(isContaFixa ? 'conta_fixa' : 'despesa')
    setDataVencimento(format(new Date(), 'yyyy-MM-dd'))
    setDescricao('')
    setCategoria('')
    setSubcategoria('none')
    setIsCreatingSubcategoria(false)
    setNovaSubcategoria('')
    setValor('')
    setStatus('Pendente')
    setContaPagamento('Unicred')
    setRecorrencia(isContaFixa ? 'Recorrente' : 'Única')
    setParcelas('2')
    setOpen(true)
  }

  const handleOpenEdit = (item: any, type: 'despesa' | 'conta_fixa') => {
    setEditId(item.id)
    setEditType(type)
    setDataVencimento(item.data_vencimento || '')
    setDescricao(item.descricao || '')
    setCategoria(item.categoria || '')
    setSubcategoria(item.subcategoria || 'none')
    setIsCreatingSubcategoria(false)
    setNovaSubcategoria('')
    setValor(item.valor.toString())
    setStatus(item.status || 'Pendente')
    setContaPagamento(item.conta_pagamento || 'Unicred')
    setRecorrencia(type === 'conta_fixa' ? 'Recorrente' : 'Única')
    setOpen(true)
  }

  const handleSave = async () => {
    if (!dataVencimento || !descricao || !categoria || !valor) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }

    let finalSubcategoria = subcategoria
    if (isCreatingSubcategoria && novaSubcategoria.trim()) {
      const { data, error } = await supabase
        .from('subcategorias_despesas' as any)
        .insert({ nome: novaSubcategoria.trim(), user_id: user?.id })
        .select()
        .single()
      if (!error && data) {
        finalSubcategoria = data.nome
        setSubcategorias((prev) => [...prev, data])
      }
    } else if (isCreatingSubcategoria && !novaSubcategoria.trim()) {
      finalSubcategoria = 'none'
    }

    const payloadBase: any = {
      descricao,
      categoria,
      subcategoria: finalSubcategoria === 'none' ? null : finalSubcategoria,
      conta_pagamento: contaPagamento,
      status,
      valor: parseFloat(valor),
    }

    if (!editId && recorrencia === 'Parcelada') {
      const numParcelas = parseInt(parcelas)
      if (isNaN(numParcelas) || numParcelas < 2) {
        toast({
          title: 'Atenção',
          description: 'Número de parcelas inválido.',
          variant: 'destructive',
        })
        return
      }

      const valorParcela = parseFloat(valor) / numParcelas
      const inserts = []

      for (let i = 0; i < numParcelas; i++) {
        const dataParcela = addMonths(parseISO(dataVencimento), i)
        inserts.push({
          ...payloadBase,
          valor: valorParcela,
          descricao: `${descricao} (${i + 1}/${numParcelas})`,
          data_vencimento: format(dataParcela, 'yyyy-MM-dd'),
          user_id: user?.id,
        })
      }

      const { error } = await supabase.from('despesas').insert(inserts)
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao salvar parcelas.', variant: 'destructive' })
        return
      }
    } else if (!editId && recorrencia === 'Recorrente') {
      const { error } = await supabase.from('contas_fixas').insert([
        {
          ...payloadBase,
          data_vencimento: dataVencimento,
          frequencia: 'Mensal',
          usuario_id: user?.id,
        },
      ])
      if (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao salvar conta recorrente.',
          variant: 'destructive',
        })
        return
      }
    } else {
      // Única ou Edição
      const table = editId ? (editType === 'conta_fixa' ? 'contas_fixas' : 'despesas') : 'despesas'

      const finalPayload = { ...payloadBase, data_vencimento: dataVencimento }
      if (table === 'contas_fixas') {
        finalPayload.usuario_id = user?.id
        if (!editId) finalPayload.frequencia = 'Mensal'
      } else {
        finalPayload.user_id = user?.id
      }

      const query = editId
        ? supabase.from(table).update(finalPayload).eq('id', editId)
        : supabase.from(table).insert([finalPayload])

      const { error } = await query
      if (error) {
        toast({ title: 'Erro', description: 'Falha ao salvar o registro.', variant: 'destructive' })
        return
      }
    }

    toast({ title: 'Sucesso', description: 'Registro salvo com sucesso.' })
    fetchDados()
    setOpen(false)
  }

  const handleDelete = async (id: string, type: 'despesa' | 'conta_fixa' = 'despesa') => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return
    const table = type === 'conta_fixa' ? 'contas_fixas' : 'despesas'
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Registro excluído com sucesso.' })
      fetchDados()
      if (open) setOpen(false)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  // Totais por conta
  const totalUnicred = todasDespesas
    .filter((d) => d.conta_pagamento?.includes('Unicred'))
    .reduce((acc, d) => acc + Number(d.valor), 0)
  const totalSicoob = todasDespesas
    .filter((d) => d.conta_pagamento?.includes('Sicoob'))
    .reduce((acc, d) => acc + Number(d.valor), 0)
  const totalEspecie = todasDespesas
    .filter((d) => d.conta_pagamento?.includes('ESPÉCIE'))
    .reduce((acc, d) => acc + Number(d.valor), 0)

  // Filtragem
  const displayedDespesas =
    activeContaFilter === 'all'
      ? todasDespesas
      : todasDespesas.filter((d) => d.conta_pagamento?.includes(activeContaFilter))

  const totalFiltrado = displayedDespesas.reduce((acc, curr) => acc + Number(curr.valor), 0)

  // Bulk Edit Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedItems(displayedDespesas.map((d) => d.id))
    else setSelectedItems([])
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) setSelectedItems((prev) => [...prev, id])
    else setSelectedItems((prev) => prev.filter((i) => i !== id))
  }

  const handleBulkSave = async () => {
    if (bulkCategory === 'none' && !bulkDate) {
      toast({
        title: 'Atenção',
        description: 'Nenhuma alteração definida.',
        variant: 'destructive',
      })
      return
    }

    const updates: any = {}
    if (bulkCategory && bulkCategory !== 'none') updates.categoria = bulkCategory
    if (bulkDate) updates.data_vencimento = bulkDate

    let errorCount = 0
    for (const id of selectedItems) {
      const item = displayedDespesas.find((d) => d.id === id)
      if (!item) continue
      const table = item._table === 'conta_fixa' ? 'contas_fixas' : 'despesas'
      const { error } = await supabase.from(table).update(updates).eq('id', id)
      if (error) errorCount++
    }

    if (errorCount > 0) {
      toast({
        title: 'Aviso',
        description: `Houve erro ao atualizar ${errorCount} registros.`,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Registros atualizados com sucesso.' })
    }

    setIsBulkEditOpen(false)
    setSelectedItems([])
    setBulkCategory('none')
    setBulkDate('')
    fetchDados()
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.length} registros?`)) return

    let errorCount = 0
    for (const id of selectedItems) {
      const item = displayedDespesas.find((d) => d.id === id)
      if (!item) continue
      const table = item._table === 'conta_fixa' ? 'contas_fixas' : 'despesas'
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) errorCount++
    }

    if (errorCount > 0) {
      toast({
        title: 'Aviso',
        description: `Houve erro ao excluir ${errorCount} registros.`,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Registros excluídos com sucesso.' })
    }

    setSelectedItems([])
    fetchDados()
  }

  const toggleContaFilter = (conta: 'Unicred' | 'Sicoob' | 'ESPÉCIE') => {
    setActiveContaFilter((prev) => (prev === conta ? 'all' : conta))
  }

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
        <div className="flex items-center gap-3 flex-wrap">
          <Button asChild variant="outline" className="gap-2 rounded-full shadow-sm">
            <Link to="/importar">
              <Upload className="w-4 h-4" /> Importar
            </Link>
          </Button>
          <Button onClick={handleOpenNew} className="gap-2 rounded-full shadow-sm">
            <Plus className="w-4 h-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
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
            {/* Cards de Contas Específicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className={cn(
                  'cursor-pointer transition-all border-border/60 shadow-sm',
                  activeContaFilter === 'Unicred'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-secondary/20',
                )}
                onClick={() => toggleContaFilter('Unicred')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Conta Unicred
                  </CardTitle>
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-foreground">
                    {formatCurrency(totalUnicred)}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'cursor-pointer transition-all border-border/60 shadow-sm',
                  activeContaFilter === 'Sicoob'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-secondary/20',
                )}
                onClick={() => toggleContaFilter('Sicoob')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Conta Sicoob
                  </CardTitle>
                  <Landmark className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-foreground">
                    {formatCurrency(totalSicoob)}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'cursor-pointer transition-all border-border/60 shadow-sm',
                  activeContaFilter === 'ESPÉCIE'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-secondary/20',
                )}
                onClick={() => toggleContaFilter('ESPÉCIE')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Conta Espécie
                  </CardTitle>
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-foreground">
                    {formatCurrency(totalEspecie)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    <div className="bg-destructive/10 p-4 rounded-full">
                      <TrendingDown className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Total{' '}
                        {activeContaFilter !== 'all' ? `(${activeContaFilter})` : 'Consolidado'}
                      </p>
                      <h3 className="text-4xl font-black text-foreground tracking-tight">
                        {formatCurrency(totalFiltrado)}
                      </h3>
                    </div>
                  </div>
                  {activeContaFilter !== 'all' && (
                    <Button
                      variant="ghost"
                      onClick={() => setActiveContaFilter('all')}
                      className="text-muted-foreground"
                    >
                      Limpar Filtro
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CostDistributionChart despesas={displayedDespesas} />
                  <MonthlyComparisonChart despesas={displayedDespesas} />
                </div>
              </div>

              <div className="lg:col-span-1">
                <BreakEvenProjection totalDespesas={totalFiltrado} />
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="p-6 border-b border-border/40 bg-secondary/10">
                <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest">
                  Lançamentos Recentes {activeContaFilter !== 'all' && `- ${activeContaFilter}`}
                </h2>
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : displayedDespesas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-16">
                  <div className="bg-primary/5 p-6 rounded-full mb-6">
                    <Receipt className="w-16 h-16 text-primary/40" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Nenhuma despesa encontrada
                  </h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-sm">
                    {activeContaFilter !== 'all'
                      ? `Não há registros para a conta ${activeContaFilter}.`
                      : 'Comece a registrar seus custos para ter um Raio-X Financeiro mais preciso.'}
                  </p>
                  <Button onClick={handleOpenNew} variant="outline" className="gap-2 rounded-full">
                    <Plus className="w-4 h-4" /> Registrar Nova Despesa
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto p-0">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[50px] text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={
                                selectedItems.length === displayedDespesas.length &&
                                displayedDespesas.length > 0
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </div>
                        </TableHead>
                        <TableHead className="h-12 font-semibold">Data</TableHead>
                        <TableHead className="h-12 font-semibold">Descrição</TableHead>
                        <TableHead className="h-12 font-semibold">Categoria</TableHead>
                        <TableHead className="h-12 font-semibold">Status</TableHead>
                        <TableHead className="h-12 text-right font-semibold">Valor</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedDespesas.map((d) => (
                        <TableRow
                          key={d.id}
                          className="group hover:bg-secondary/20 transition-colors"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={selectedItems.includes(d.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectItem(d.id, checked as boolean)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium py-4 text-muted-foreground">
                            {d.data_vencimento
                              ? format(parseISO(d.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })
                              : '-'}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-semibold">{d.descricao}</div>
                            <div className="text-xs text-muted-foreground font-normal mt-1 flex items-center gap-2">
                              {d._table === 'conta_fixa' && (
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                                  Fixa
                                </span>
                              )}
                              {d.conta_pagamento && (
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" /> {d.conta_pagamento}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-md text-xs font-medium border border-border/50">
                                {d.categoria}
                              </span>
                              {d.subcategoria && (
                                <span className="text-[10px] text-muted-foreground px-1 font-semibold">
                                  {d.subcategoria}
                                </span>
                              )}
                            </div>
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
                                onClick={() => handleOpenEdit(d, d._table as any)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(d.id, d._table as any)}
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

              {/* Barra de Ações em Lote */}
              {selectedItems.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
                  <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap">
                    {selectedItems.length} selecionados
                  </span>
                  <div className="h-6 w-px bg-border mx-1" />
                  <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        className="rounded-full shadow-sm gap-2 h-10 whitespace-nowrap px-6"
                      >
                        <Edit className="w-4 h-4" /> Editar Lote
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar {selectedItems.length} registros</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-5 py-4">
                        <div className="space-y-2">
                          <Label>Nova Categoria</Label>
                          <Select value={bulkCategory} onValueChange={setBulkCategory}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Manter atual" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Manter atual</SelectItem>
                              {CATEGORIAS.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Nova Data de Vencimento</Label>
                          <Input
                            type="date"
                            className="h-11"
                            value={bulkDate}
                            onChange={(e) => setBulkDate(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Deixe em branco para manter a data atual.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsBulkEditOpen(false)}
                          className="rounded-full h-11 px-6"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleBulkSave} className="rounded-full h-11 px-6">
                          Salvar Alterações
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    className="rounded-full shadow-sm gap-2 h-10 whitespace-nowrap px-6"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4" /> Excluir Lote
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendario" className="mt-0 outline-none w-full">
            <ContasAPagarTab
              contas={displayedDespesas}
              onOpenNew={handleOpenNew}
              onEdit={(d: any) => handleOpenEdit(d, d._table as any)}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Modal Nova Transação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Nova Transação</DialogTitle>
            <DialogDescription>
              Registre uma nova entrada ou saída na conta {contaPagamento}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Descrição</Label>
              <Input
                placeholder="Ex: Aluguel, Fornecedor..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-secondary/20 h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Valor Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="bg-secondary/20 font-medium h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Data Inicial</Label>
                <Input
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  className="bg-secondary/20 h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Tipo</Label>
                <Select value="Saída" disabled>
                  <SelectTrigger className="bg-secondary/20 h-11 opacity-70">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saída">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Recorrência</Label>
                <Select value={recorrencia} onValueChange={setRecorrencia} disabled={!!editId}>
                  <SelectTrigger className="border-primary text-primary font-medium h-11">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Única">Única</SelectItem>
                    <SelectItem value="Recorrente">Recorrente</SelectItem>
                    <SelectItem value="Parcelada">Parcelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-foreground flex justify-between">
                  Categoria
                </Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="bg-secondary/20 h-11">
                    <SelectValue placeholder="Selecione" />
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
                <Label className="font-semibold text-foreground flex justify-between">
                  Subcategoria
                </Label>
                {!isCreatingSubcategoria ? (
                  <Select
                    value={subcategoria}
                    onValueChange={(val) => {
                      if (val === 'new') {
                        setIsCreatingSubcategoria(true)
                        setSubcategoria('none')
                      } else {
                        setSubcategoria(val)
                      }
                    }}
                  >
                    <SelectTrigger className="bg-secondary/20 h-11">
                      <SelectValue placeholder="Selecione ou crie..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {subcategorias.map((sub) => (
                        <SelectItem key={sub.id} value={sub.nome}>
                          {sub.nome}
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="font-semibold text-primary">
                        <Plus className="w-4 h-4 inline mr-2" />
                        Nova Subcategoria...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome da subcategoria"
                      value={novaSubcategoria}
                      onChange={(e) => setNovaSubcategoria(e.target.value)}
                      className="bg-secondary/20 h-11"
                      autoFocus
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 shrink-0"
                      onClick={() => {
                        setIsCreatingSubcategoria(false)
                        setNovaSubcategoria('')
                        setSubcategoria('none')
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {recorrencia === 'Parcelada' && !editId && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="font-semibold text-foreground">Quantidade de Parcelas</Label>
                  <Input
                    type="number"
                    min="2"
                    max="120"
                    placeholder="2"
                    value={parcelas}
                    onChange={(e) => setParcelas(e.target.value)}
                    className="bg-secondary/20 h-11 border-primary"
                  />
                </div>
              )}

              {recorrencia !== 'Parcelada' && (
                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-secondary/20 h-11">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Conta / Cartão</Label>
                <Select value={contaPagamento} onValueChange={setContaPagamento}>
                  <SelectTrigger className="bg-secondary/20 h-11">
                    <SelectValue placeholder="Selecione a conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unicred">Conta Unicred</SelectItem>
                    <SelectItem value="Sicoob">Conta Sicoob</SelectItem>
                    <SelectItem value="ESPÉCIE">Conta ESPÉCIE</SelectItem>
                    <SelectItem value="Cartão de Crédito Unicred">
                      Cartão de Créd. Unicred
                    </SelectItem>
                    <SelectItem value="Cartão de Crédito Sicoob">Cartão de Créd. Sicoob</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-border/40">
              {editId && (
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive h-11"
                  onClick={() => handleDelete(editId, editType)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Salvar Transação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
