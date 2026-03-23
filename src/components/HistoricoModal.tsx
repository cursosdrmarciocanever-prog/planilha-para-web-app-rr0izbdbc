import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicamentoId: string | null
  medicamentoNome: string
}

export function HistoricoModal({ open, onOpenChange, medicamentoId, medicamentoNome }: Props) {
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && medicamentoId) {
      setLoading(true)
      supabase
        .from('medicamento_historico' as any)
        .select('*')
        .eq('medicamento_id', medicamentoId)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setHistorico(data || [])
          setLoading(false)
        })
    }
  }, [open, medicamentoId])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Histórico de Precificação
          </DialogTitle>
          <p
            className="text-sm text-muted-foreground font-medium truncate pr-6"
            title={medicamentoNome}
          >
            {medicamentoNome}
          </p>
        </DialogHeader>

        <ScrollArea className="h-[350px] mt-4 pr-4">
          {loading ? (
            <p className="text-sm text-center py-8 text-muted-foreground">Carregando...</p>
          ) : historico.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum registro de alteração encontrado.
            </p>
          ) : (
            <div className="space-y-4 pt-2 ml-2">
              {historico.map((h) => (
                <div
                  key={h.id}
                  className="relative pl-6 pb-2 border-l-2 border-primary/20 last:border-0 last:pb-0"
                >
                  <div className="absolute left-[-7px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    {formatDate(h.created_at)}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm bg-secondary/30 p-3 rounded-lg border border-border/50">
                    <div>
                      <span className="block text-[10px] uppercase text-muted-foreground font-medium mb-0.5">
                        Custo
                      </span>
                      <span className="font-semibold">{formatCurrency(h.custo_aquisicao)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-muted-foreground font-medium mb-0.5">
                        Venda
                      </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(h.preco_venda_final)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-muted-foreground font-medium mb-0.5">
                        Margem
                      </span>
                      <span className="font-semibold">{Number(h.margem_lucro).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
