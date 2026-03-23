import { useState } from 'react'
import { Calculator, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useFuncionarios, Funcionario } from '@/hooks/use-funcionarios'

import { DashboardKPIs } from '@/components/custo/DashboardKPIs'
import { FuncionarioList } from '@/components/custo/FuncionarioList'
import { FuncionarioDialog } from '@/components/custo/FuncionarioDialog'
import { SimuladorROI } from '@/components/custo/SimuladorROI'

export default function Custo() {
  const { funcionarios, fetching, saveFuncionario, deleteFuncionario } = useFuncionarios()
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFunc, setEditingFunc] = useState<Funcionario | null>(null)

  const handleOpenNew = () => {
    setEditingFunc(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (f: Funcionario) => {
    setEditingFunc(f)
    setDialogOpen(true)
  }

  const handleSave = async (data: Partial<Funcionario>) => {
    try {
      await saveFuncionario(data)
      toast({ title: 'Sucesso', description: 'Colaborador salvo com sucesso.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este colaborador?')) return
    try {
      await deleteFuncionario(id)
      toast({ title: 'Sucesso', description: 'Colaborador removido.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-primary" />
            Gestão de Equipe (GM Metrics)
          </h1>
          <p className="text-slate-600 text-[15px] max-w-2xl">
            Analise o custo efetivo, a produtividade e o ROI de cada colaborador utilizando a
            metodologia GM Metrics para escalar a lucratividade da sua operação.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="shrink-0 shadow-sm">
          <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
          Novo Colaborador
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 max-w-md bg-slate-100 p-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="simulador">Simulador ROI</TabsTrigger>
        </TabsList>

        {fetching ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <TabsContent value="dashboard" className="mt-0">
              <DashboardKPIs funcionarios={funcionarios} />
            </TabsContent>
            <TabsContent value="equipe" className="mt-0">
              <FuncionarioList
                funcionarios={funcionarios}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
            <TabsContent value="simulador" className="mt-0">
              <SimuladorROI />
            </TabsContent>
          </>
        )}
      </Tabs>

      <FuncionarioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        initialData={editingFunc}
      />
    </div>
  )
}
