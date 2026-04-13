import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { useLembretes } from '@/hooks/use-lembretes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'

export default function Layout() {
  const { selectedConta, setSelectedConta } = useLembretes()

  const formatCurrency = (val: number | undefined | null) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val ?? 0)

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent flex-1">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/40 bg-background/80 backdrop-blur-sm px-4 lg:hidden sticky top-0 z-10">
            <SidebarTrigger className="text-primary hover:text-primary/80" />
            <span className="font-bold text-sm tracking-widest uppercase text-foreground">
              Canever Financeiro
            </span>
          </header>
          <main className="w-full mx-auto pb-12">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={!!selectedConta} onOpenChange={(open) => !open && setSelectedConta(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Conta a Pagar</DialogTitle>
            <DialogDescription>Detalhes do lembrete de vencimento.</DialogDescription>
          </DialogHeader>
          {selectedConta && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm">Descrição:</span>
                <span className="col-span-3 text-sm">{selectedConta.descricao}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm">Valor:</span>
                <span className="col-span-3 font-bold text-rose-600">
                  {formatCurrency(selectedConta.valor)}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-semibold text-right text-sm">Vencimento:</span>
                <span className="col-span-3 text-sm">
                  {selectedConta.data_vencimento
                    ? format(parseISO(selectedConta.data_vencimento), 'dd/MM/yyyy')
                    : 'N/A'}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedConta(null)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                setSelectedConta(null)
                window.location.href = '/despesas'
              }}
            >
              Ir para Despesas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
