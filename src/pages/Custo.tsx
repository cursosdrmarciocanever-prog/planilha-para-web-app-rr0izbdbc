import { Calculator, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Custo() {
  return (
    <div className="p-6 md:p-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-[#3b5bdb]" />
            Custo Funcionário
          </h1>
          <p className="text-slate-600 text-[15px]">
            Cadastre funcionários e veja o custo mensal e por hora de cada um (encargos: FGTS, INSS,
            férias, 13º e aviso prévio).
          </p>
        </div>
        <div className="shrink-0 mt-2 md:mt-0">
          <Button className="bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium shadow-sm rounded-lg px-6 h-[42px] text-[15px]">
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            porta
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white border border-slate-200 rounded-xl min-h-[500px] flex flex-col items-center justify-center shadow-sm p-8">
        <div className="flex flex-col items-center max-w-md text-center">
          <Calculator className="w-16 h-16 text-slate-300 mb-6" strokeWidth={1.5} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum funcionário cadastrado</h3>
          <p className="text-slate-500 text-[15px]">
            Clique em "Adicionar funcionário" para cadastrar o primeiro.
          </p>
        </div>
      </div>
    </div>
  )
}
