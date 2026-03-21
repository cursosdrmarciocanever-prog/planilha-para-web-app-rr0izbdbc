import { useState, useEffect } from 'react'
import { Calculator, Plus, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Funcionario {
  id: string
  nome: string
  salario_base: number
}

export default function Custo() {
  const [open, setOpen] = useState(false)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [nome, setNome] = useState('')
  const [salarioBase, setSalarioBase] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { toast } = useToast()

  const fetchFuncionarios = async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from('funcionarios' as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFuncionarios(data)
    }
    setFetching(false)
  }

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const handleSave = async () => {
    if (!nome || !salarioBase) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('funcionarios' as any)
      .insert([{ nome, salario_base: parseFloat(salarioBase) }])
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Funcionário cadastrado com sucesso.' })
      setFuncionarios([data, ...funcionarios])
      setOpen(false)
      setNome('')
      setSalarioBase('')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('funcionarios' as any)
      .delete()
      .eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Funcionário removido.' })
      setFuncionarios(funcionarios.filter((f) => f.id !== id))
    }
  }

  // 8% FGTS + 20% INSS + 11.11% Férias + 8.33% 13º + encargos extras = ~47.44%
  const ENCARGOS_PERCENTUAL = 0.4744

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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium shadow-sm rounded-lg px-6 h-[42px] text-[15px]">
                <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
                Adicionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Funcionário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome do Funcionário</Label>
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salário Base (R$)</Label>
                  <Input
                    type="number"
                    value={salarioBase}
                    onChange={(e) => setSalarioBase(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-[#3b5bdb] hover:bg-[#364fc7]"
                >
                  {loading ? 'Salvando...' : 'Cadastrar Funcionário'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b5bdb]"></div>
        </div>
      ) : funcionarios.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl min-h-[400px] flex flex-col items-center justify-center shadow-sm p-8">
          <div className="flex flex-col items-center max-w-md text-center">
            <Calculator className="w-16 h-16 text-slate-300 mb-6" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum funcionário cadastrado</h3>
            <p className="text-slate-500 text-[15px] mb-6">
              Clique em "Adicionar funcionário" para cadastrar o primeiro.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-[#3b5bdb] hover:bg-[#364fc7] text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Funcionário
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcionarios.map((f) => {
            const custoMensal = f.salario_base * (1 + ENCARGOS_PERCENTUAL)
            const custoHora = custoMensal / 220
            return (
              <div
                key={f.id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group hover:shadow-md transition-all"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(f.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3b5bdb]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{f.nome}</h3>
                    <p className="text-sm text-slate-500">
                      Salário:{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(f.salario_base)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Custo Mensal (aprox)</span>
                    <span className="font-semibold text-slate-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(custoMensal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Custo por Hora</span>
                    <span className="font-semibold text-[#3b5bdb]">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(custoHora)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
