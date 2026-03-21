import { useState } from 'react'
import { FileDown, Plus, X, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function RaioX() {
  const [open, setOpen] = useState(false)
  const handlePrint = () => window.print()

  return (
    <div className="p-6 md:p-10 animate-fade-in print:p-0 print:m-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Raio-X Financeiro</h1>
          <p className="text-slate-500 mt-1">Análise completa da saúde financeira</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={handlePrint}
            className="flex-1 md:flex-none bg-[#a5dbb7] hover:bg-[#88c99e] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4"
          >
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4">
                <Plus className="w-4 h-4" /> Novo Mês
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Novo Mês</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Mês/Ano</Label>
                  <Input type="month" />
                </div>
                <Button
                  onClick={() => setOpen(false)}
                  className="w-full bg-[#3b5bdb] hover:bg-[#364fc7]"
                >
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 mb-8 flex flex-col md:flex-row items-end gap-5 shadow-sm print:hidden">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <Label className="text-sm font-medium text-slate-700">Data Inicial</Label>
          </div>
          <Input
            placeholder="Dia/Mês/Ano"
            className="h-10 border-slate-200 text-slate-600 focus-visible:ring-slate-200"
          />
        </div>
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <Label className="text-sm font-medium text-slate-700">Dados finais</Label>
          </div>
          <Input
            placeholder="Dia/Mês/Ano"
            className="h-10 border-slate-200 text-slate-600 focus-visible:ring-slate-200"
          />
        </div>
        <Button
          variant="outline"
          className="h-10 px-6 text-slate-600 border-slate-200 hover:bg-slate-50 w-full md:w-auto font-medium"
        >
          <X className="w-4 h-4 mr-2 text-slate-400" /> Limpar Filtro
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Faturamento Total
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">R$ 0,00</h3>
            <p className="text-[13px] text-slate-500 font-medium">Receita acumulada</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Custos Totais
            </p>
            <h3 className="text-3xl font-bold text-[#e03131] mb-2">R$ 0,00</h3>
            <p className="text-[13px] text-slate-500 font-medium">Despesas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Lucro Sogra
            </p>
            <h3 className="text-3xl font-bold text-[#2b8a3e] mb-2">R$ 0,00</h3>
            <p className="text-[13px] text-slate-500 font-medium">Resultado</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Margem
            </p>
            <h3 className="text-3xl font-bold text-[#3b5bdb] mb-2">0,0 %</h3>
            <p className="text-[13px] text-slate-500 font-medium">Lucratividade</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolução Financeira Section */}
      <div className="mt-10">
        <Card className="shadow-sm border-slate-200/60 rounded-xl bg-white overflow-hidden print:shadow-none print:border-none">
          <div className="p-6 pb-4 border-b border-slate-100 print:border-none print:px-0">
            <h2 className="text-[16px] font-semibold text-[#8d5b4c]">Evolução Financeira</h2>
          </div>
          <div className="p-6 print:px-0">
            <div className="w-full h-full min-h-[400px] border border-dashed border-slate-200 rounded-xl flex items-end justify-center pb-6 bg-slate-50/30 print:border-none print:bg-transparent">
              <div className="w-12 h-1.5 rounded-full bg-slate-400/60"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
