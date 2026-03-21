import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SalaManager from './taxa-sala/SalaManager'
import OcupacaoManager from './taxa-sala/OcupacaoManager'
import Dashboard from './taxa-sala/Dashboard'
import { Building2, ChartBar, CalendarDays, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePDF } from '@/lib/utils'

export default function TaxaSala() {
  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Gestão de Salas (Método GM)
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Análise estratégica de rentabilidade, margem de contribuição e ocupação das salas.
          </p>
        </div>
        <Button onClick={generatePDF} variant="outline" className="shrink-0 rounded-full shadow-sm">
          <Printer className="w-4 h-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full flex flex-col gap-6">
        <TabsList className="h-auto p-1.5 bg-secondary/40 rounded-2xl w-full sm:w-fit inline-flex flex-wrap shadow-sm border border-border/50">
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
          <TabsTrigger
            value="salas"
            className="px-6 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
          >
            <Building2 className="w-4 h-4" /> <span className="font-medium">Cadastro de Salas</span>
          </TabsTrigger>
        </TabsList>

        <div className="bg-background rounded-3xl">
          <TabsContent value="dashboard" className="animate-fade-in-up mt-0 outline-none">
            <Dashboard />
          </TabsContent>
          <TabsContent value="ocupacoes" className="animate-fade-in-up mt-0 outline-none">
            <OcupacaoManager />
          </TabsContent>
          <TabsContent value="salas" className="animate-fade-in-up mt-0 outline-none">
            <SalaManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
