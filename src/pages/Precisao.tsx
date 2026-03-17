import { FileDown, Plus, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Precisao() {
  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Precificação de Serviços
          </h1>
          <p className="text-slate-500 mt-1 text-[15px]">
            Gerencie custos, margens e preços dos seus serviços
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button className="flex-1 md:flex-none bg-[#a5dbb7] hover:bg-[#88c99e] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4">
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
          <Button className="flex-1 md:flex-none bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4">
            <Plus className="w-4 h-4" /> Novo
          </Button>
        </div>
      </div>

      {/* Main Card Container */}
      <Card className="shadow-sm border-slate-200/60 rounded-xl bg-white flex-1 flex flex-col">
        <div className="p-6">
          <h2 className="text-[16px] font-semibold text-[#8d5b4c]">Serviços e Produtos</h2>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center pb-20">
          <DollarSign className="w-20 h-20 text-slate-300 mb-6" strokeWidth={1} />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">nenhum serviço cadastrado</h3>
          <p className="text-slate-500 text-[15px]">
            Adicione seus serviços para calcular preços e margens
          </p>
        </div>
      </Card>
    </div>
  )
}
