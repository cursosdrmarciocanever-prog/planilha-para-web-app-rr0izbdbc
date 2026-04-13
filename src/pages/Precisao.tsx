import { useState, useEffect } from 'react'
import { FileDown, Plus, DollarSign, Edit, Trash2, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { generatePDF } from '@/lib/utils'

interface ProdutoServico {
  id: string
  nome: string
  custo_estimado: number
  preco: number
}

export default function Precisao() {
  const [open, setOpen] = useState(false)
  const [servicos, setServicos] = useState<ProdutoServico[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [editId, setEditId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [custoEstimado, setCustoEstimado] = useState('')
  const [precoVenda, setPrecoVenda] = useState('')

  // Import State
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const { toast } = useToast()

  const fetchServicos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('produtos_servicos')
      .select('id, nome, custo_estimado, preco')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setServicos(data as ProdutoServico[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchServicos()
  }, [])

  const handleOpenNew = () => {
    setEditId(null)
    setNome('')
    setCustoEstimado('')
    setPrecoVenda('')
    setOpen(true)
  }

  const handleOpenEdit = (s: ProdutoServico) => {
    setEditId(s.id)
    setNome(s.nome)
    setCustoEstimado(s.custo_estimado?.toString() || '0')
    setPrecoVenda(s.preco?.toString() || '0')
    setOpen(true)
  }

  const handleSave = async () => {
    if (!nome) {
      toast({
        title: 'Atenção',
        description: 'O nome do serviço é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      nome,
      custo_estimado: parseFloat(custoEstimado || '0'),
      preco: parseFloat(precoVenda || '0'),
    }

    if (editId) {
      const { error } = await supabase.from('produtos_servicos').update(payload).eq('id', editId)
      if (error)
        toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Serviço atualizado.' })
        fetchServicos()
        setOpen(false)
      }
    } else {
      const { error } = await supabase.from('produtos_servicos').insert([payload])
      if (error)
        toast({ title: 'Erro', description: 'Falha ao cadastrar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Serviço cadastrado com sucesso.' })
        fetchServicos()
        setOpen(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return
    const { error } = await supabase.from('produtos_servicos').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Serviço excluído.' })
      fetchServicos()
    }
  }

  const handleBulkImport = async () => {
    if (!importText.trim()) return

    const rows = importText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean)
    const payload = rows.map((row) => {
      // Tenta separar por tabulação (padrão de cópia do Excel/Sheets)
      let cols = row.split('\t')

      // Fallback para ponto e vírgula se não houver tabulação
      if (cols.length === 1) {
        cols = row.split(';')
      }

      // Fallback para separar o último número se tiver apenas um separador de espaço "Procedimento 150,00"
      if (cols.length === 1) {
        const match = row.match(/(.+?)\s+([\d.,R$\s]+)$/)
        if (match) {
          cols = [match[1], match[2]]
        }
      }

      const nomeCol = cols[0]?.trim() || 'Serviço sem nome'
      let precoCol = 0

      if (cols.length > 1) {
        // Limpa a string de preço (remove R$, espaços)
        let priceStr = cols[cols.length - 1].replace(/[R$\s]/gi, '')

        // Se tem vírgula, assume que é o separador decimal (padrão BR)
        if (priceStr.includes(',')) {
          priceStr = priceStr.replace(/\./g, '').replace(',', '.')
        }

        precoCol = parseFloat(priceStr) || 0
      }

      return {
        nome: nomeCol,
        preco: precoCol,
        custo_estimado: 0,
      }
    })

    if (payload.length === 0) return

    setIsImporting(true)
    const { error } = await supabase.from('produtos_servicos').insert(payload)
    setIsImporting(false)

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao importar os dados.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: `${payload.length} serviços importados com sucesso.` })
      setImportOpen(false)
      setImportText('')
      fetchServicos()
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const handlePrint = () => generatePDF('simples')

  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-screen print:p-0 print:m-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Precificação</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gerencie custos, margens e preços dos seus serviços
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => setImportOpen(true)}
            variant="outline"
            className="flex-1 md:flex-none gap-2"
          >
            <Upload className="w-4 h-4" /> Importar Planilha
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex-1 md:flex-none gap-2">
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
          <Button onClick={handleOpenNew} className="flex-1 md:flex-none gap-2">
            <Plus className="w-4 h-4" /> Novo Serviço
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <Card className="shadow-sm border-border/60 rounded-2xl bg-card flex-1 flex flex-col print:border-none print:shadow-none overflow-hidden">
        <div className="p-6 border-b border-border/40 print:border-none print:px-0 bg-secondary/20">
          <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest">
            Serviços e Produtos
          </h2>
        </div>

        {loading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : servicos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center pb-20 print:hidden">
            <div className="bg-primary/5 p-6 rounded-full mb-6">
              <DollarSign className="w-16 h-16 text-primary/40" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Nenhum serviço cadastrado</h3>
            <p className="text-muted-foreground text-[16px] max-w-sm text-center">
              Adicione seus serviços e produtos para começar a calcular preços e margens de forma
              inteligente.
            </p>
            <div className="flex gap-4 mt-8">
              <Button onClick={() => setImportOpen(true)} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Importar de Planilha
              </Button>
              <Button onClick={handleOpenNew} className="gap-2">
                <Plus className="w-4 h-4" /> Cadastrar Manualmente
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servicos.map((s) => {
              const margem = s.preco > 0 ? ((s.preco - s.custo_estimado) / s.preco) * 100 : 0
              return (
                <Card
                  key={s.id}
                  className="relative group border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden bg-background"
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleOpenEdit(s)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-4 pr-16">
                      <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                        {s.nome}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Custo Estimado</span>
                        <span className="font-medium">{formatCurrency(s.custo_estimado)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Preço de Venda</span>
                        <span className="font-bold text-primary">{formatCurrency(s.preco)}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-border/50 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Margem
                        </span>
                        <span
                          className={`text-sm font-bold ${margem >= 20 ? 'text-green-600' : 'text-amber-500'}`}
                        >
                          {margem.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Card>

      {/* Cadastrar / Editar Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome do Serviço</Label>
              <Input
                placeholder="Ex: Consulta de Rotina"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Custo Estimado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={custoEstimado}
                onChange={(e) => setCustoEstimado(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço de Venda (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} className="w-full mt-2">
              {editId ? 'Salvar Alterações' : 'Salvar Serviço'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Importar Planilha Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Procedimentos</DialogTitle>
            <DialogDescription>
              Cole abaixo os dados da sua planilha (Excel, Google Sheets).
              <br />O formato esperado é: <strong>Nome do Procedimento</strong> na primeira coluna e{' '}
              <strong>Valor de Venda</strong> na última coluna.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Textarea
                placeholder={`Exemplo:\nConsulta de Rotina\t350,00\nRetorno\t200,00\nAvaliação\t500,00`}
                className="min-h-[250px] font-mono text-sm leading-relaxed"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setImportOpen(false)} disabled={isImporting}>
                Cancelar
              </Button>
              <Button onClick={handleBulkImport} disabled={!importText.trim() || isImporting}>
                {isImporting ? 'Importando...' : 'Importar Dados'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
