import { FileDown, Plus, X, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Diario() {
  return (
    <div className="p-6 md:p-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Controle Diário de Metas
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe sua agenda e pacientes diários</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button className="flex-1 md:flex-none bg-[#a5dbb7] hover:bg-[#88c99e] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4">
            <FileDown className="w-4 h-4" /> Gerar PDF
          </Button>
          <Button className="flex-1 md:flex-none bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4">
            <Plus className="w-4 h-4" /> Novo Registro
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 mb-8 flex flex-col md:flex-row items-end gap-5 shadow-sm">
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
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Faturamento Total
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">R$ 0,00</h3>
            <p className="text-[13px] text-slate-500 font-medium">Consultas + procedimentos</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Consultas
            </p>
            <h3 className="text-[22px] leading-tight font-bold text-slate-900 mb-2">
              0 atendimentos · <br className="hidden xl:block" />
              R$ 0,00
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Pacientes em consulta e receita gerada
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl">
          <CardContent className="p-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">S</p>
            <h3 className="text-[22px] leading-tight font-bold text-slate-900 mb-2">
              0 atendimentos · <br className="hidden xl:block" />
              R$ 0,00
            </h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Procedimentos realizados e receita gerada
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/60 rounded-xl flex flex-col justify-between">
          <CardContent className="p-6 h-full flex flex-col">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
              Bilheteria
            </p>
            <div className="space-y-1.5 mb-4 flex-1">
              <div className="flex items-center text-[14px]">
                <span className="text-slate-500 font-medium w-28">Geral:</span>
                <span className="font-semibold text-slate-900">R$ 0,00</span>
              </div>
              <div className="flex items-center text-[14px]">
                <span className="text-slate-500 font-medium w-28">Consultas:</span>
                <span className="font-semibold text-slate-900">R$ 0,00</span>
              </div>
              <div className="flex items-center text-[14px]">
                <span className="text-slate-500 font-medium w-28">Procedimentos:</span>
                <span className="font-semibold text-slate-900">R$ 0,00</span>
              </div>
            </div>
            <p className="text-[13px] text-slate-500 font-medium mt-auto">0 dias · R$ 0,00 /dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Records Empty State */}
      <Card className="shadow-sm border-slate-200/60 rounded-xl min-h-[400px] flex flex-col bg-white">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-bold text-slate-800">Registros Diários</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-16">
          <div className="mb-6 text-slate-400">
            <TrendingUp className="w-16 h-16" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum registro encontrado</h3>
          <p className="text-slate-500">Comece adicionando seu primeiro registro diário</p>
        </div>
      </Card>
    </div>
  )
}
