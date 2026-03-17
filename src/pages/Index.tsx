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
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Painel</h1>
          <p className="text-muted-foreground mt-2 text-lg">Visão geral do seu desempenho</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-card border border-border rounded-full shadow-sm p-1.5 pl-4">
            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="w-32 border-none shadow-none ml-1">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent h-8">
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
            <div className="w-24 border-none shadow-none border-l border-border pl-1">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent h-8">
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
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full ml-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Gerar PDF
          </Button>
        </div>
      </div>

      {/* Exibindo dados pill */}
      <div className="flex items-center gap-3 mb-10">
        <span className="text-sm font-medium text-muted-foreground">Exibindo dados de:</span>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1.5 font-semibold border border-primary/20"
        >
          {selectedMonth} de {selectedYear}
        </Badge>
      </div>

      {/* Indicadores Section */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Principais Indicadores
          </h2>
          <ToggleGroup
            type="single"
            defaultValue="todos"
            className="bg-card border border-border p-1 rounded-full shadow-sm"
          >
            <ToggleGroupItem
              value="todos"
              className="data-[state=on]:bg-secondary data-[state=on]:text-foreground rounded-full px-6 text-sm h-9 font-medium text-muted-foreground"
            >
              Todos
            </ToggleGroupItem>
            <ToggleGroupItem
              value="consultas"
              className="data-[state=on]:bg-secondary data-[state=on]:text-foreground rounded-full px-6 text-sm h-9 font-medium text-muted-foreground"
            >
              Consultas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Faturamento Total
                </p>
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-foreground mb-2">R$ 0,00</h3>
              <p className="text-sm font-medium text-muted-foreground">Controle do mês</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Total de Pacientes
                </p>
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-foreground mb-2">0</h3>
              <p className="text-sm font-medium text-muted-foreground">Consultas + procedimentos</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Bilheteria
                </p>
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-foreground mb-2">R$ 0,00</h3>
              <p className="text-sm font-medium text-muted-foreground">Por causa</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Margem de Lucro
                </p>
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-foreground mb-2">0,0%</h3>
              <p className="text-sm font-medium text-muted-foreground">R$ 0,00</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Evolução Section */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
          Evolução no Período
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/60 rounded-2xl bg-card">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-foreground">
                Faturamento por dia
              </CardTitle>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                {selectedMonth} de {selectedYear}
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[300px] w-full bg-secondary/30 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-16 h-1 rounded-full bg-border mb-4 mt-auto"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 rounded-2xl bg-card">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-foreground">Pacientes por dia</CardTitle>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                {selectedMonth} de {selectedYear}
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[300px] w-full bg-secondary/30 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-16 h-1 rounded-full bg-border mb-4 mt-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
