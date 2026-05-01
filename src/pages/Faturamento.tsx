import { useState } from 'react'
import { DollarSign, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FaturamentoDashboard } from '@/components/faturamento/FaturamentoDashboard'
import { FaturamentoEntradas } from '@/components/faturamento/FaturamentoEntradas'
import { FaturamentoSaidas } from '@/components/faturamento/FaturamentoSaidas'

export default function Faturamento() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-screen print:p-0 print:m-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary" /> Faturamento
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Módulo completo de faturamento e controle de recebíveis
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 rounded-full shadow-sm">
          <Link to="/importar?tipo=entradas">
            <Upload className="w-4 h-4" /> Importar Planilha
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
        <TabsList className="h-auto p-1.5 bg-secondary/40 rounded-2xl w-full sm:w-fit inline-flex flex-wrap shadow-sm border border-border/50 print:hidden">
          <TabsTrigger
            value="dashboard"
            className="px-5 py-2.5 rounded-xl font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="entradas"
            className="px-5 py-2.5 rounded-xl font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Entradas
          </TabsTrigger>
          <TabsTrigger
            value="saidas"
            className="px-5 py-2.5 rounded-xl font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Saídas
          </TabsTrigger>
        </TabsList>

        <div className="w-full">
          <TabsContent value="dashboard" className="mt-0 outline-none">
            <FaturamentoDashboard />
          </TabsContent>
          <TabsContent value="entradas" className="mt-0 outline-none">
            <FaturamentoEntradas />
          </TabsContent>
          <TabsContent value="saidas" className="mt-0 outline-none">
            <FaturamentoSaidas />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
