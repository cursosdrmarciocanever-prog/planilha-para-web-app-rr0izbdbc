import { useState } from 'react'
import { CalendarIcon, Download, X, DollarSign, Users, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function Index() {
  const [selectedMonth, setSelectedMonth] = useState('Março')
  const [selectedYear, setSelectedYear] = useState('2026')

  const handleClear = () => {
    setSelectedMonth('Março')
    setSelectedYear('2026')
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Painel</h1>
          <p className="text-slate-500 mt-2 text-lg">Visão geral do seu desempenho</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm p-1">
            <CalendarIcon className="w-4 h-4 ml-3 text-slate-400 shrink-0" />
            <div className="w-32 border-none shadow-none ml-1">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Janeiro">Janeiro</SelectItem>
                  <SelectItem value="Fevereiro">Fevereiro</SelectItem>
                  <SelectItem value="Março">Março</SelectItem>
                  <SelectItem value="Abril">Abril</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 border-none shadow-none border-l border-slate-100 pl-1">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button className="bg-[#3b5bdb] hover:bg-[#364fc7] text-white gap-2 shadow-sm rounded-lg h-10 px-6">
            <Download className="w-4 h-4" /> Gerar PDF
          </Button>
        </div>
      </div>

      {/* Exibindo dados pill */}
      <div className="flex items-center gap-3 mb-10">
        <span className="text-sm font-medium text-slate-600">Exibindo dados de:</span>
        <Badge
          variant="secondary"
          className="bg-blue-50 text-[#3b5bdb] hover:bg-blue-100 px-4 py-1.5 rounded-full font-semibold border border-blue-100/50"
        >
          {selectedMonth} de {selectedYear}
        </Badge>
      </div>

      {/* Indicadores Section */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Principais Indicadores
          </h2>
          <ToggleGroup
            type="single"
            defaultValue="todos"
            className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm"
          >
            <ToggleGroupItem
              value="todos"
              className="data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 rounded-lg px-6 text-sm h-8 font-medium text-slate-500"
            >
              Todos
            </ToggleGroupItem>
            <ToggleGroupItem
              value="consultas"
              className="data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 rounded-lg px-6 text-sm h-8 font-medium text-slate-500"
            >
              Consultas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-slate-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Faturamento Total
                </p>
                <div className="bg-blue-50 p-2.5 rounded-xl text-[#3b5bdb]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-2">R$ 0,00</h3>
              <p className="text-sm font-medium text-slate-400">Controle do mês</p>
            </CardContent>
          </Card>

          <Card className="shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-slate-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Total de Pacientes
                </p>
                <div className="bg-blue-50 p-2.5 rounded-xl text-[#3b5bdb]">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-2">0</h3>
              <p className="text-sm font-medium text-slate-400">Consultas + procedimentos</p>
            </CardContent>
          </Card>

          <Card className="shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-slate-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Bilheteria
                </p>
                <div className="bg-blue-50 p-2.5 rounded-xl text-[#3b5bdb]">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-2">R$ 0,00</h3>
              <p className="text-sm font-medium text-slate-400">Por causa</p>
            </CardContent>
          </Card>

          <Card className="shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-slate-100 rounded-2xl overflow-hidden hover:border-blue-100 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Margem de Lucro
                </p>
                <div className="bg-blue-50 p-2.5 rounded-xl text-[#3b5bdb]">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-2">0,0%</h3>
              <p className="text-sm font-medium text-slate-400">R$ 0,00</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Evolução Section */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
          Evolução no Período
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border-slate-100 rounded-2xl">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-slate-700">
                Faturamento por dia
              </CardTitle>
              <p className="text-sm font-medium text-slate-400 mt-1">
                {selectedMonth} de {selectedYear}
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[300px] w-full bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-1 rounded-full bg-slate-200 mb-4 mt-auto"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border-slate-100 rounded-2xl">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-slate-700">Pacientes por dia</CardTitle>
              <p className="text-sm font-medium text-slate-400 mt-1">
                {selectedMonth} de {selectedYear}
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[300px] w-full bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-1 rounded-full bg-slate-200 mb-4 mt-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
