import { useState, useEffect, useMemo } from 'react'
import { Pill, FileDown, Plus, Edit, Trash2, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { generatePDF } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Medicamento {
  id: string
  nome: string
  custo_aquisicao: number
  margem_lucro: number
  impostos: number
  preco_venda_sugerido: number
  preco_venda_final: number
}

export default function Medicamentos() {
  const [open, setOpen] = useState(false)
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [editId, setEditId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [custo, setCusto] = useState('')
  const [margem, setMargem] = useState('')
  const [impostos, setImpostos] = useState('')
  const [precoFinal, setPrecoFinal] = useState('')

  const { toast } = useToast()

  const fetchMedicamentos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('medicamentos_precificacao' as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMedicamentos(data as Medicamento[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMedicamentos()
  }, [])

  const precoSugerido = useMemo(() => {
    const c = parseFloat(custo) || 0
    const m = parseFloat(margem) || 0
    const i = parseFloat(impostos) || 0
    // Markup sobre o custo: Custo * (1 + Margem% + Impostos%)
    return c * (1 + (m + i) / 100)
  }, [custo, margem, impostos])

  const handleOpenNew = () => {
    setEditId(null)
    setNome('')
    setCusto('')
    setMargem('50')
    setImpostos('6')
    setPrecoFinal('')
    setOpen(true)
  }

  const handleOpenEdit = (m: Medicamento) => {
    setEditId(m.id)
    setNome(m.nome)
    setCusto(m.custo_aquisicao?.toString() || '0')
    setMargem(m.margem_lucro?.toString() || '0')
    setImpostos(m.impostos?.toString() || '0')
    setPrecoFinal(m.preco_venda_final?.toString() || '0')
    setOpen(true)
  }

  const handleSave = async () => {
    if (!nome) {
      toast({
        title: 'Atenção',
        description: 'O nome do medicamento é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      nome,
      custo_aquisicao: parseFloat(custo || '0'),
      margem_lucro: parseFloat(margem || '0'),
      impostos: parseFloat(impostos || '0'),
      preco_venda_sugerido: precoSugerido,
      preco_venda_final: parseFloat(precoFinal || precoSugerido.toString()),
    }

    if (editId) {
      const { error } = await supabase
        .from('medicamentos_precificacao' as any)
        .update(payload)
        .eq('id', editId)
      if (error)
        toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Medicamento atualizado.' })
        fetchMedicamentos()
        setOpen(false)
      }
    } else {
      const { error } = await supabase.from('medicamentos_precificacao' as any).insert([payload])
      if (error)
        toast({ title: 'Erro', description: 'Falha ao cadastrar.', variant: 'destructive' })
      else {
        toast({ title: 'Sucesso', description: 'Medicamento cadastrado com sucesso.' })
        fetchMedicamentos()
        setOpen(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este medicamento?')) return
    const { error } = await supabase
      .from('medicamentos_precificacao' as any)
      .delete()
      .eq('id', id)
    if (error) toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Medicamento excluído.' })
      fetchMedicamentos()
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const handlePrint = generatePDF

  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-screen print:p-0 print:m-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Pill className="w-8 h-8 text-primary" /> Precificação de Medicamentos
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gerencie custos, impostos, margens e preços finais dos seus insumos e medicamentos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button onClick={handlePrint} variant="outline" className="flex-1 md:flex-none gap-2">
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
          <Button onClick={handleOpenNew} className="flex-1 md:flex-none gap-2">
            <Plus className="w-4 h-4" /> Novo Medicamento
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border/60 rounded-2xl bg-card flex-1 flex flex-col print:border-none print:shadow-none overflow-hidden">
        <div className="p-6 border-b border-border/40 print:border-none print:px-0 bg-secondary/20">
          <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Tabela de Precificação
          </h2>
        </div>

        {loading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : medicamentos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center pb-20 print:hidden">
            <div className="bg-primary/5 p-6 rounded-full mb-6">
              <Pill className="w-16 h-16 text-primary/40" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Nenhum medicamento cadastrado
            </h3>
            <p className="text-muted-foreground text-[16px] max-w-sm text-center">
              Adicione os medicamentos e insumos para calcular preços ideais de forma automatizada.
            </p>
            <Button onClick={handleOpenNew} className="mt-8 gap-2">
              <Plus className="w-4 h-4" /> Cadastrar Primeiro Medicamento
            </Button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {medicamentos.map((m) => {
              const impostosCalculados = m.custo_aquisicao * (m.impostos / 100)
              const lucroReal = m.preco_venda_final - m.custo_aquisicao - impostosCalculados
              const margemReal =
                m.custo_aquisicao > 0
                  ? (lucroReal / m.custo_aquisicao) * 100
                  : m.preco_venda_final > 0
                    ? 100
                    : 0

              return (
                <Card
                  key={m.id}
                  className="relative group border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden bg-background"
                >
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary bg-background/80 backdrop-blur-sm"
                      onClick={() => handleOpenEdit(m)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive bg-background/80 backdrop-blur-sm"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardHeader className="pb-2 pt-5 px-5">
                    <CardTitle className="text-lg font-bold pr-16 line-clamp-1" title={m.nome}>
                      {m.nome}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-2">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Custo (R$)</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(m.custo_aquisicao)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">
                          Impostos (%)
                        </p>
                        <p className="font-semibold text-foreground">{m.impostos}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">
                          Margem Alvo
                        </p>
                        <p className="font-semibold text-foreground">{m.margem_lucro}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">
                          Margem Real
                        </p>
                        <p
                          className={`font-semibold ${margemReal >= m.margem_lucro ? 'text-green-600' : 'text-amber-500'}`}
                        >
                          {margemReal.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex justify-between items-center bg-secondary/20 -mx-5 px-5 pb-1 mt-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Sugerido
                        </p>
                        <p className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                          {formatCurrency(m.preco_venda_sugerido)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Preço Final
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(m.preco_venda_final)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Medicamento' : 'Cadastrar Medicamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label>Nome do Medicamento / Insumo</Label>
              <Input
                placeholder="Ex: Toxina Botulínica 100U"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custo de Aquisição (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={custo}
                  onChange={(e) => setCusto(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Impostos (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="6.00"
                  value={impostos}
                  onChange={(e) => setImpostos(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Margem de Lucro Desejada (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="50.00"
                value={margem}
                onChange={(e) => setMargem(e.target.value)}
              />
            </div>

            <Alert className="bg-primary/5 border-primary/20 py-3">
              <Calculator className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm font-medium text-foreground ml-2">
                Preço de Venda Sugerido:{' '}
                <span className="font-bold text-primary ml-1">{formatCurrency(precoSugerido)}</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <Label className="text-primary font-bold">Preço de Venda Final (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precoFinal}
                onChange={(e) => setPrecoFinal(e.target.value)}
                className="border-primary/50 focus-visible:ring-primary h-12 text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Se deixado em branco, assumirá o preço sugerido de {formatCurrency(precoSugerido)}.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={handleSave} className="w-full sm:w-auto min-w-[120px]">
              {editId ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
