import { useState } from 'react'
import { FileDown, Plus, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Precisao() {
  const [open, setOpen] = useState(false)
  const handlePrint = () => window.print()

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
          <Button onClick={handlePrint} variant="outline" className="flex-1 md:flex-none gap-2">
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none gap-2">
                <Plus className="w-4 h-4" /> Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome do Serviço</Label>
                  <Input placeholder="Ex: Consulta de Rotina" />
                </div>
                <div className="space-y-2">
                  <Label>Custo Estimado (R$)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda (R$)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <Button onClick={() => setOpen(false)} className="w-full">
                  Salvar Serviço
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Card Container */}
      <Card className="shadow-sm border-border/60 rounded-2xl bg-card flex-1 flex flex-col print:border-none print:shadow-none">
        <div className="p-6 border-b border-border/40 print:border-none print:px-0">
          <h2 className="text-[16px] font-bold text-foreground uppercase tracking-widest">
            Serviços e Produtos
          </h2>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center pb-20 print:hidden">
          <div className="bg-primary/5 p-6 rounded-full mb-6">
            <DollarSign className="w-16 h-16 text-primary/40" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Nenhum serviço cadastrado</h3>
          <p className="text-muted-foreground text-[16px] max-w-sm text-center">
            Adicione seus serviços e produtos para começar a calcular preços e margens de forma
            inteligente.
          </p>
          <Button onClick={() => setOpen(true)} className="mt-8 gap-2">
            <Plus className="w-4 h-4" /> Cadastrar Primeiro Serviço
          </Button>
        </div>
      </Card>
    </div>
  )
}
