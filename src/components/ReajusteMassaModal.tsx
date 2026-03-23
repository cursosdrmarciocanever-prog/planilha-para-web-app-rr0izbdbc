import { useState, useMemo } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Medicamento } from '@/pages/Medicamentos'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicamentos: Medicamento[]
  onSuccess: () => void
}

export function ReajusteMassaModal({ open, onOpenChange, medicamentos, onSuccess }: Props) {
  const [categoria, setCategoria] = useState<string>('todas')
  const [percentual, setPercentual] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const categorias = useMemo(
    () => Array.from(new Set(medicamentos.map((m) => m.categoria).filter(Boolean))) as string[],
    [medicamentos],
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const reajustados = useMemo(() => {
    const p = parseFloat(percentual) / 100 || 0
    if (p === 0) return []

    return medicamentos
      .filter((m) => categoria === 'todas' || m.categoria === categoria)
      .map((m) => {
        const novoCusto = m.custo_aquisicao * (1 + p)
        const novoCustoReposicao = (m.custo_reposicao || m.custo_aquisicao) * (1 + p)

        // Mantém a margem de lucro intacta recalculando o preço de venda
        const novoPreco = novoCusto * (1 + (m.margem_lucro + m.impostos) / 100)

        return {
          ...m,
          novoCusto,
          novoCustoReposicao,
          novoPreco,
        }
      })
  }, [medicamentos, categoria, percentual])

  const aplicarReajuste = async () => {
    if (reajustados.length === 0) return

    setLoading(true)
    let errors = 0

    for (const item of reajustados) {
      const { error } = await supabase
        .from('medicamentos_precificacao' as any)
        .update({
          custo_aquisicao: item.novoCusto,
          custo_reposicao: item.novoCustoReposicao,
          preco_venda_final: item.novoPreco,
          preco_venda_sugerido: item.novoPreco,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) errors++
    }

    setLoading(false)

    if (errors > 0) {
      toast({
        title: 'Aviso',
        description: `Reajuste concluído com ${errors} erros.`,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: `${reajustados.length} medicamentos reajustados com sucesso mantendo a margem atual.`,
      })
      onOpenChange(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" /> Reajuste em Massa (Inflação / Mercado)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="w-4 h-4 text-primary" />
            <AlertDescription className="text-xs">
              Aplique um percentual de reajuste no custo dos medicamentos. O sistema aumentará o{' '}
              <strong>Preço de Venda</strong> automaticamente para manter a exata mesma{' '}
              <strong>Margem de Lucro</strong> atual.
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
              <Label>Aumento do Custo (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={percentual}
                onChange={(e) => setPercentual(e.target.value)}
                placeholder="Ex: 5.5 para aumentar 5,5%"
              />
            </div>
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-3 mt-4">
            <div className="space-y-3">
              {reajustados.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1 truncate pr-4">
                    <p className="font-medium truncate">{m.nome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Margem Mantida: {m.margem_lucro.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-muted-foreground mb-0.5">
                        Custo (R$)
                      </p>
                      <p className="line-through text-muted-foreground text-[11px]">
                        {formatCurrency(m.custo_aquisicao)}
                      </p>
                      <p className="font-semibold text-orange-600">{formatCurrency(m.novoCusto)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-muted-foreground mb-0.5">
                        Venda (R$)
                      </p>
                      <p className="line-through text-muted-foreground text-[11px]">
                        {formatCurrency(m.preco_venda_final)}
                      </p>
                      <p className="font-semibold text-primary">{formatCurrency(m.novoPreco)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {reajustados.length === 0 && (
                <p className="text-sm text-center text-muted-foreground p-8">
                  Nenhum item afetado ou percentual zerado.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={aplicarReajuste} disabled={reajustados.length === 0 || loading}>
            {loading ? 'Aplicando...' : 'Confirmar Reajuste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
