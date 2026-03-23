import { useState, useEffect } from 'react'
import {
  Pill,
  FileDown,
  Plus,
  Edit,
  Trash2,
  Calculator,
  Settings2,
  History as HistoryIcon,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
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
import { generatePDF, cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SimuladorModal } from '@/components/SimuladorModal'
import { HistoricoModal } from '@/components/HistoricoModal'
import { ReajusteMassaModal } from '@/components/ReajusteMassaModal'

export interface Medicamento {
  id: string
  nome: string
  categoria?: string
  custo_aquisicao: number
  custo_reposicao?: number
  margem_lucro: number
  impostos: number
  preco_venda_sugerido: number
  preco_venda_final: number
  ativo?: boolean
}

export default function Medicamentos() {
  const [open, setOpen] = useState(false)
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [loading, setLoading] = useState(true)

  const [margemMinima, setMargemMinima] = useState<number>(() =>
    Number(localStorage.getItem('margemMinima') || '30'),
  )

  // Modals state
  const [simuladorOpen, setSimuladorOpen] = useState(false)
  const [reajusteOpen, setReajusteOpen] = useState(false)
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const [historicoId, setHistoricoId] = useState<string | null>(null)
  const [historicoNome, setHistoricoNome] = useState('')

  // Form State
  const [editId, setEditId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [custo, setCusto] = useState('')
  const [custoReposicao, setCustoReposicao] = useState('')
  const [margem, setMargem] = useState('')
  const [impostos, setImpostos] = useState('')
  const [precoFinal, setPrecoFinal] = useState('')
  const [ativo, setAtivo] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('margemMinima', margemMinima.toString())
  }, [margemMinima])

  const fetchMedicamentos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('medicamentos_precificacao' as any)
      .select('*')
      .order('nome', { ascending: true })

    if (!error && data) {
      setMedicamentos(data as Medicamento[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMedicamentos()
  }, [])

  const handleCustoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCusto(val)
    if (!custoReposicao || custoReposicao === custo) {
      setCustoReposicao(val)
    }
    const c = parseFloat(val) || 0
    const m = parseFloat(margem) || 0
    const i = parseFloat(impostos) || 0
    const novoPreco = c * (1 + (m + i) / 100)
    setPrecoFinal(novoPreco > 0 ? novoPreco.toFixed(2) : '')
  }

  const handleImpostosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setImpostos(val)
    const i = parseFloat(val) || 0
    const c = parseFloat(custo) || 0
    const p = parseFloat(precoFinal) || 0
    if (c > 0 && p > 0) {
      const novaMargem = (p / c - 1) * 100 - i
      setMargem(novaMargem.toFixed(2))
    }
  }

  const handlePrecoFinalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPrecoFinal(val)
    const p = parseFloat(val) || 0
    const c = parseFloat(custo) || 0
    const i = parseFloat(impostos) || 0

    if (c > 0) {
      const novaMargem = (p / c - 1) * 100 - i
      setMargem(novaMargem.toFixed(2))
    } else if (c === 0 && p > 0) {
      setMargem('100')
    }
  }

  const handleMargemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMargem(val)
    const m = parseFloat(val) || 0
    const c = parseFloat(custo) || 0
    const i = parseFloat(impostos) || 0
    const novoPreco = c * (1 + (m + i) / 100)
    setPrecoFinal(novoPreco > 0 ? novoPreco.toFixed(2) : '')
  }

  const handleOpenNew = () => {
    setEditId(null)
    setNome('')
    setCategoria('')
    setCusto('')
    setCustoReposicao('')
    setMargem('50')
    setImpostos('6')
    setPrecoFinal('')
    setAtivo(true)
    setOpen(true)
  }

  const handleOpenEdit = (m: Medicamento) => {
    setEditId(m.id)
    setNome(m.nome)
    setCategoria(m.categoria || '')
    setCusto(m.custo_aquisicao?.toString() || '0')
    setCustoReposicao(m.custo_reposicao?.toString() || m.custo_aquisicao?.toString() || '0')
    setMargem(m.margem_lucro?.toString() || '0')
    setImpostos(m.impostos?.toString() || '0')
    setPrecoFinal(m.preco_venda_final?.toString() || '0')
    setAtivo(m.ativo !== false)
    setOpen(true)
  }

  const handleOpenHistorico = (m: Medicamento) => {
    setHistoricoId(m.id)
    setHistoricoNome(m.nome)
    setHistoricoOpen(true)
  }

  const handleSave = async () => {
    if (!nome) {
      toast({ title: 'Atenção', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }

    const pFinalNum = parseFloat(precoFinal || '0')
    const payload = {
      nome,
      categoria,
      ativo,
      custo_aquisicao: parseFloat(custo || '0'),
      custo_reposicao: parseFloat(custoReposicao || custo || '0'),
      margem_lucro: parseFloat(margem || '0'),
      impostos: parseFloat(impostos || '0'),
      preco_venda_sugerido: pFinalNum,
      preco_venda_final: pFinalNum,
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
        toast({ title: 'Sucesso', description: 'Medicamento cadastrado.' })
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

  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-screen print:p-0 print:m-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Pill className="w-8 h-8 text-primary" /> Precificação de Medicamentos
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gerencie custos e calcule automaticamente as margens de lucro dos insumos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                title="Configurar Margem Mínima"
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-3">
                <h4 className="font-medium">Configuração de Alerta</h4>
                <p className="text-xs text-muted-foreground">
                  Defina a margem de lucro mínima segura. Itens abaixo deste valor serão destacados.
                </p>
                <div className="flex items-center gap-3">
                  <Label className="shrink-0">Mínima (%)</Label>
                  <Input
                    type="number"
                    value={margemMinima}
                    onChange={(e) => setMargemMinima(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => setReajusteOpen(true)}
            variant="outline"
            className="flex-1 md:flex-none gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reajuste
          </Button>
          <Button
            onClick={() => setSimuladorOpen(true)}
            variant="secondary"
            className="flex-1 md:flex-none gap-2"
          >
            <TrendingUp className="w-4 h-4" /> Simulador
          </Button>
          <Button onClick={generatePDF} variant="outline" className="flex-1 md:flex-none gap-2">
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button onClick={handleOpenNew} className="flex-1 md:flex-none gap-2">
            <Plus className="w-4 h-4" /> Novo
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
            <h3 className="text-2xl font-bold mb-3">Nenhum medicamento</h3>
            <Button onClick={handleOpenNew} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Cadastrar Primeiro
            </Button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {medicamentos.map((m) => {
              const cReposicao = m.custo_reposicao || m.custo_aquisicao
              const impostosCalculados = m.custo_aquisicao * (m.impostos / 100)
              const impostosReposicao = cReposicao * (m.impostos / 100)

              const lucroReal = m.preco_venda_final - m.custo_aquisicao - impostosCalculados
              const lucroReposicao = m.preco_venda_final - cReposicao - impostosReposicao

              const margemReal =
                m.custo_aquisicao > 0
                  ? (lucroReal / m.custo_aquisicao) * 100
                  : m.preco_venda_final > 0
                    ? 100
                    : 0
              const margemRep = cReposicao > 0 ? (lucroReposicao / cReposicao) * 100 : 0

              const isAbaixoMargem = margemReal < margemMinima && m.ativo !== false
              const isRiscoEstoque =
                cReposicao > m.custo_aquisicao && margemRep < margemMinima && m.ativo !== false

              return (
                <Card
                  key={m.id}
                  className={cn(
                    'relative group border-border/60 shadow-sm hover:shadow-md transition-all flex flex-col',
                    m.ativo === false && 'opacity-60 grayscale-[0.5]',
                    isAbaixoMargem &&
                      !isRiscoEstoque &&
                      'border-destructive/50 shadow-destructive/10 bg-destructive/5',
                    isRiscoEstoque && 'border-orange-500/50 shadow-orange-500/10 bg-orange-500/5',
                  )}
                >
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary bg-background/80"
                      onClick={() => handleOpenHistorico(m)}
                    >
                      <HistoryIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary bg-background/80"
                      onClick={() => handleOpenEdit(m)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive bg-background/80"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="pr-24">
                      <CardTitle className="text-lg font-bold line-clamp-2" title={m.nome}>
                        {m.nome}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {m.categoria && (
                          <Badge variant="secondary" className="font-medium text-[10px]">
                            {m.categoria}
                          </Badge>
                        )}
                        {m.ativo === false && (
                          <Badge variant="destructive" className="font-medium text-[10px]">
                            Inativo
                          </Badge>
                        )}
                        {isAbaixoMargem && !isRiscoEstoque && (
                          <Badge
                            variant="destructive"
                            className="font-medium text-[10px] animate-pulse"
                          >
                            Margem Baixa
                          </Badge>
                        )}
                        {isRiscoEstoque && (
                          <Badge
                            variant="outline"
                            className="font-medium text-[10px] animate-pulse border-orange-500 text-orange-600 bg-orange-50"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" /> Risco Reposição
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-end">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                      <div>
                        <p className="text-[11px] text-muted-foreground font-medium mb-1">
                          Custo Estoque
                        </p>
                        <p className="font-semibold text-sm">{formatCurrency(m.custo_aquisicao)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground font-medium mb-1 flex items-center gap-1">
                          Custo Reposição
                        </p>
                        <p
                          className={cn(
                            'font-semibold text-sm',
                            cReposicao > m.custo_aquisicao ? 'text-orange-600' : '',
                          )}
                        >
                          {formatCurrency(cReposicao)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-muted-foreground font-medium mb-1">
                          Margem Atual
                        </p>
                        <p
                          className={`font-semibold text-sm ${isAbaixoMargem ? 'text-destructive' : margemReal >= 0 ? 'text-green-600' : 'text-destructive'}`}
                        >
                          {margemReal.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground font-medium mb-1">
                          Margem Reposição
                        </p>
                        <p
                          className={`font-semibold text-sm ${isRiscoEstoque ? 'text-orange-600' : margemRep >= 0 ? 'text-green-600' : 'text-destructive'}`}
                        >
                          {margemRep.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex justify-between items-center bg-secondary/20 -mx-5 px-5 pb-1 mt-2">
                      <div className="text-right w-full flex justify-between items-center">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Preço de Venda
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

      <SimuladorModal
        open={simuladorOpen}
        onOpenChange={setSimuladorOpen}
        medicamentos={medicamentos}
        onSuccess={fetchMedicamentos}
      />
      <ReajusteMassaModal
        open={reajusteOpen}
        onOpenChange={setReajusteOpen}
        medicamentos={medicamentos}
        onSuccess={fetchMedicamentos}
      />
      <HistoricoModal
        open={historicoOpen}
        onOpenChange={setHistoricoOpen}
        medicamentoId={historicoId}
        medicamentoNome={historicoNome}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Medicamento' : 'Cadastrar Medicamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
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
                <Label>Categoria</Label>
                <Input
                  placeholder="Ex: Antioxidantes"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex flex-col justify-center pt-2">
                <Label className="mb-2">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={ativo} onCheckedChange={setAtivo} />
                  <span className="text-sm font-medium">{ativo ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custo Aquisição (Estoque)</Label>
                <Input type="number" step="0.01" value={custo} onChange={handleCustoChange} />
              </div>
              <div className="space-y-2">
                <Label>Custo de Reposição (Mercado)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={custoReposicao}
                  onChange={(e) => setCustoReposicao(e.target.value)}
                  className="border-orange-200 focus-visible:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Impostos (%)</Label>
                <Input type="number" step="0.01" value={impostos} onChange={handleImpostosChange} />
              </div>
            </div>

            <Alert
              className={cn(
                'border py-4 flex flex-col gap-3 mt-2',
                (parseFloat(margem) || 0) < margemMinima
                  ? 'bg-destructive/10 border-destructive/50'
                  : 'bg-primary/5 border-primary/20',
              )}
            >
              <div className="flex items-center gap-2">
                <Calculator
                  className={cn(
                    'h-4 w-4',
                    (parseFloat(margem) || 0) < margemMinima ? 'text-destructive' : 'text-primary',
                  )}
                />
                <AlertDescription
                  className={cn(
                    'text-sm font-semibold',
                    (parseFloat(margem) || 0) < margemMinima
                      ? 'text-destructive'
                      : 'text-foreground',
                  )}
                >
                  Calculadora de Precificação{' '}
                  {(parseFloat(margem) || 0) < margemMinima && '- Abaixo da margem segura!'}
                </AlertDescription>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] text-primary font-bold uppercase tracking-wider">
                    Preço de Venda (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={precoFinal}
                    onChange={handlePrecoFinalChange}
                    className="border-primary/50 focus-visible:ring-primary font-bold text-primary h-11 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Margem de Lucro (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={margem}
                    onChange={handleMargemChange}
                    className={cn(
                      'h-11 font-semibold',
                      (parseFloat(margem) || 0) < margemMinima &&
                        'text-destructive border-destructive focus-visible:ring-destructive',
                    )}
                  />
                </div>
              </div>
            </Alert>
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
