import { useState, useMemo } from 'react'
import { TrendingUp, AlertCircle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Medicamento } from '@/pages/Medicamentos'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicamentos: Medicamento[]
  onSuccess: () => void
}

export function SimuladorModal({ open, onOpenChange, medicamentos, onSuccess }: Props) {
  const [categoria, setCategoria] = useState<string>('todas')
  const [ajuste, setAjuste] = useState<string>('10')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const categorias = useMemo(
    () => Array.from(new Set(medicamentos.map((m) => m.categoria).filter(Boolean))) as string[],
    [medicamentos],
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const simulados = useMemo(() => {
    return medicamentos
      .filter((m) => categoria === 'todas' || m.categoria === categoria)
      .map((m) => {
        const percentual = parseFloat(ajuste) / 100 || 0
        const novoCusto = m.custo_aquisicao * (1 + percentual)
        const impostosCalculados = novoCusto * (m.impostos / 100)
        const novoLucro = m.preco_venda_final - novoCusto - impostosCalculados
        const novaMargem =
          novoCusto > 0 ? (novoLucro / novoCusto) * 100 : m.preco_venda_final > 0 ? 100 : 0

        const lucroAtual =
          m.preco_venda_final - m.custo_aquisicao - m.custo_aquisicao * (m.impostos / 100)

        return { ...m, novoCusto, novoLucro, novaMargem, lucroAtual }
      })
  }, [medicamentos, categoria, ajuste])

  const lucroAtualTotal = simulados.reduce((acc, curr) => acc + curr.lucroAtual, 0)
  const lucroNovoTotal = simulados.reduce((acc, curr) => acc + curr.novoLucro, 0)

  const aplicarSimulacao = async () => {
    setLoading(true)
    let errors = 0
    for (const item of simulados) {
      const { error } = await supabase
        .from('medicamentos_precificacao' as any)
        .update({
          custo_aquisicao: item.novoCusto,
          margem_lucro: item.novaMargem,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
      if (error) errors++
    }
    setLoading(false)
    if (errors > 0) {
      toast({
        title: 'Aviso',
        description: `Finalizado com ${errors} erros.`,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: `${simulados.length} medicamentos atualizados.` })
      onOpenChange(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Simulador de Impacto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="w-4 h-4 text-primary" />
            <AlertDescription className="text-xs">
              Simule alterações no <strong>Custo de Aquisição</strong>. O Preço de Venda Final será
              mantido, e a Margem de Lucro será recalculada automaticamente para demonstrar o
              impacto na rentabilidade.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria Alvo</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ajuste no Custo (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={ajuste}
                onChange={(e) => setAjuste(e.target.value)}
                placeholder="Ex: 10 para aumento"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2 p-4 rounded-lg bg-secondary/20 border border-border/50">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lucro Total Atual</p>
              <p className="text-xl font-bold">{formatCurrency(lucroAtualTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lucro Total Simulado</p>
              <p
                className={cn(
                  'text-xl font-bold',
                  lucroNovoTotal >= lucroAtualTotal ? 'text-green-600' : 'text-destructive',
                )}
              >
                {formatCurrency(lucroNovoTotal)}
              </p>
            </div>
          </div>

          <ScrollArea className="h-[200px] border rounded-md p-3">
            <div className="space-y-3">
              {simulados.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex-1 truncate pr-4">
                    <p className="font-medium truncate">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Nova Margem: {m.novaMargem.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="line-through text-muted-foreground text-[11px]">
                      {formatCurrency(m.custo_aquisicao)}
                    </p>
                    <p className="font-semibold text-primary">{formatCurrency(m.novoCusto)}</p>
                  </div>
                </div>
              ))}
              {simulados.length === 0 && (
                <p className="text-sm text-center text-muted-foreground p-4">
                  Nenhum item encontrado.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={aplicarSimulacao} disabled={simulados.length === 0 || loading}>
            {loading ? 'Aplicando...' : 'Aplicar e Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
