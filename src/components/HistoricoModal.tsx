import { useState, useEffect } from 'react'
import { History, Download, FileSpreadsheet, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

  const handleExportCSV = () => {
    if (historico.length === 0) return
    const headers = ['Data de Alteracao', 'Custo Aquisicao', 'Preco Venda', 'Margem Lucro (%)']
    const rows = historico.map((h) => [
      formatDate(h.created_at),
      h.custo_aquisicao,
      h.preco_venda_final,
      Number(h.margem_lucro).toFixed(2),
    ])

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `historico_preco_${medicamentoNome.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>Histórico - ${medicamentoNome}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
            th { background-color: #f5f5f5; }
            h2 { margin-bottom: 5px; }
            p { color: #666; margin-top: 0; }
          </style>
        </head>
        <body>
          <h2>Histórico de Precificação</h2>
          <p>Medicamento: <strong>${medicamentoNome}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Custo</th>
                <th>Preço de Venda</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              ${historico
                .map(
                  (h) => `
                <tr>
                  <td>${formatDate(h.created_at)}</td>
                  <td>${formatCurrency(h.custo_aquisicao)}</td>
                  <td>${formatCurrency(h.preco_venda_final)}</td>
                  <td>${Number(h.margem_lucro).toFixed(1)}%</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row justify-between items-start pr-8">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Histórico de Precificação
            </DialogTitle>
            <p
              className="text-sm text-muted-foreground font-medium truncate mt-1"
              title={medicamentoNome}
            >
              {medicamentoNome}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <Download className="w-3.5 h-3.5" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint} className="gap-2 cursor-pointer">
                <Printer className="w-4 h-4 text-primary" /> Imprimir (PDF)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
