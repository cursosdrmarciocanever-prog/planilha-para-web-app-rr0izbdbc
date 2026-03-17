import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SalaManager from './taxa-sala/SalaManager'
import OcupacaoManager from './taxa-sala/OcupacaoManager'
import Dashboard from './taxa-sala/Dashboard'
import { Building2, ChartBar, CalendarDays } from 'lucide-react'

export default function TaxaSala() {
  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
          Taxa de Sala e Ocupação
        </h1>
        <p className="text-muted-foreground text-[16px]">
          Gerencie as salas, registre ocupações e analise a receita gerada em tempo real.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 h-auto p-1 bg-secondary/50 rounded-xl inline-flex shadow-sm">
          <TabsTrigger
            value="dashboard"
            className="px-6 py-2.5 rounded-lg flex gap-2 items-center data-[state=active]:shadow-sm"
          >
            <ChartBar className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="ocupacoes"
            className="px-6 py-2.5 rounded-lg flex gap-2 items-center data-[state=active]:shadow-sm"
          >
            <CalendarDays className="w-4 h-4" /> Ocupações
          </TabsTrigger>
          <TabsTrigger
            value="salas"
            className="px-6 py-2.5 rounded-lg flex gap-2 items-center data-[state=active]:shadow-sm"
          >
            <Building2 className="w-4 h-4" /> Salas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="animate-fade-in-up mt-0 outline-none">
          <Dashboard />
        </TabsContent>
        <TabsContent value="ocupacoes" className="animate-fade-in-up mt-0 outline-none">
          <OcupacaoManager />
        </TabsContent>
        <TabsContent value="salas" className="animate-fade-in-up mt-0 outline-none">
          <SalaManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
