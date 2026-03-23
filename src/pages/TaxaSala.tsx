import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RegistroTaxaSala from './taxa-sala/RegistroTaxaSala'
import OcupacaoManager from './taxa-sala/OcupacaoManager'
import Dashboard from './taxa-sala/Dashboard'
import { Calculator, ChartBar, CalendarDays, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePDF } from '@/lib/utils'

export default function TaxaSala() {
  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col gap-8 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Taxa de Sala</h1>
          <p className="text-muted-foreground text-base max-w-3xl">
            Controle despesas operacionais fixas e salas para calcular custo por hora e por turno
            (Método GM Metrics).
          </p>
        </div>
        <Button onClick={generatePDF} variant="outline" className="shrink-0 rounded-full shadow-sm">
          <Printer className="w-4 h-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      <Tabs defaultValue="registro" className="w-full flex flex-col gap-6">
        <TabsList className="h-auto p-1.5 bg-secondary/40 rounded-2xl w-full sm:w-fit inline-flex flex-wrap shadow-sm border border-border/50">
          <TabsTrigger
            value="registro"
            className="px-6 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
          >
            <Calculator className="w-4 h-4" />{' '}
            <span className="font-medium">Registro de Taxa de Sala</span>
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            className="px-6 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
          >
            <ChartBar className="w-4 h-4" /> <span className="font-medium">Visão Estratégica</span>
          </TabsTrigger>
          <TabsTrigger
            value="ocupacoes"
            className="px-6 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
          >
            <CalendarDays className="w-4 h-4" /> <span className="font-medium">Ocupações</span>
          </TabsTrigger>
        </TabsList>

        <div className="bg-transparent rounded-3xl w-full">
          <TabsContent value="registro" className="animate-fade-in-up mt-0 outline-none w-full">
            <RegistroTaxaSala />
          </TabsContent>
          <TabsContent
            value="dashboard"
            className="animate-fade-in-up mt-0 outline-none bg-background p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 w-full"
          >
            <Dashboard />
          </TabsContent>
          <TabsContent
            value="ocupacoes"
            className="animate-fade-in-up mt-0 outline-none bg-background p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 w-full"
          >
            <OcupacaoManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
