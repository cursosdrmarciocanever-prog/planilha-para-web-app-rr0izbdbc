import { useState, useEffect } from 'react'
import { Receipt, Plus, Trash2, Edit, TrendingDown } from 'lucide-react'
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

interface Despesa {
  id: string
  data_vencimento: string
  descricao: string
  categoria: string
  valor: number
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

  const { toast } = useToast()

  const fetchDespesas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('despesas')
      .select('id, data_vencimento, descricao, categoria, valor')
      .order('data_vencimento', { ascending: false })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as despesas.',
        variant: 'destructive',
      })
    } else {
      setDespesas(data || [])
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
    setOpen(true)
  }

  const handleOpenEdit = (despesa: Despesa) => {
    setEditId(despesa.id)
    setDataVencimento(despesa.data_vencimento || '')
    setDescricao(despesa.descricao || '')
    setCategoria(despesa.categoria || '')
    setValor(despesa.valor.toString())
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
    }

    if (editId) {
      const { error } = await supabase.from('despesas').update(payload).eq('id', editId)
      if (error)
        toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Despesa atualizada com sucesso.' })
        fetchDespesas()
        setOpen(false)
      }
    } else {
      const { error } = await supabase.from('despesas').insert([payload])
      if (error)
        toast({ title: 'Erro', description: 'Falha ao cadastrar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Despesa cadastrada com sucesso.' })
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
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary" />
            Despesas Operacionais
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Registre e gerencie todos os custos e despesas da clínica.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="bg-destructive/10 p-4 rounded-full">
            <TrendingDown className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Total Consolidado
            </p>
            <h3 className="text-3xl font-bold text-foreground">{formatCurrency(totalDespesas)}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest">
            Lançamentos
          </h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : despesas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="bg-primary/5 p-6 rounded-full mb-6">
              <Receipt className="w-16 h-16 text-primary/40" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma despesa registrada</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Comece a registrar seus custos para ter um Raio-X Financeiro mais preciso.
            </p>
            <Button onClick={handleOpenNew} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Registrar Primeira Despesa
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto p-0">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((d) => (
                  <TableRow key={d.id} className="group hover:bg-secondary/20">
                    <TableCell className="font-medium">
                      {d.data_vencimento
                        ? format(parseISO(d.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell>{d.descricao}</TableCell>
                    <TableCell>
                      <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                        {d.categoria}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatCurrency(d.valor)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(d)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(d.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Data de Vencimento / Pagamento</Label>
              <Input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Conta de Luz"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
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
              />
            </div>
            <Button onClick={handleSave} className="w-full mt-2">
              {editId ? 'Salvar Alterações' : 'Cadastrar Despesa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
