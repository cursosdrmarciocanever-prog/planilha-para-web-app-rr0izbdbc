import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Funcionario } from '@/hooks/use-funcionarios'
import { useLocalStorage } from '@/hooks/use-local-storage'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSave: (f: Partial<Funcionario>) => Promise<void>
  initialData?: Funcionario | null
  isNew?: boolean
}

const DEFAULT_DRAFT: Partial<Funcionario> = {
  encargos_percentual: 47.44,
  horas_mensais: 220,
  beneficios_mensais: 0,
  receita_gerada: 0,
  meta_receita: 0,
  setor: 'Geral',
  nome: '',
  salario_base: 0,
}

export function FuncionarioDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isNew = true,
}: Props) {
  const [draft, setDraft] = useLocalStorage<Partial<Funcionario>>(
    'custo-funcionario-draft',
    DEFAULT_DRAFT,
  )

  const [formData, setFormData] = useState<Partial<Funcionario>>(DEFAULT_DRAFT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (isNew) {
        setFormData({ ...DEFAULT_DRAFT, ...draft })
      } else if (initialData) {
        setFormData(initialData)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isNew, initialData])

  const handleChange = (field: keyof Funcionario, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (isNew) {
        setDraft(next)
      }
      return next
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSave(formData)
      if (isNew) {
        setDraft(DEFAULT_DRAFT)
      }
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isNew && !initialData && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center p-8">Carregando dados...</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {!isNew ? 'Editar Colaborador' : 'Novo Colaborador (GM Metrics)'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Colaborador</Label>
            <Input
              value={formData.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Setor / Departamento</Label>
            <Input
              value={formData.setor || ''}
              onChange={(e) => handleChange('setor', e.target.value)}
            />
          </div>

          <div className="col-span-1 md:col-span-2 mt-2 font-semibold text-slate-700 border-b pb-2">
            Custos & Encargos
          </div>

          <div className="space-y-2">
            <Label>Salário Base (R$)</Label>
            <Input
              type="number"
              value={formData.salario_base || ''}
              onChange={(e) => handleChange('salario_base', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Encargos (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.encargos_percentual || ''}
              onChange={(e) => handleChange('encargos_percentual', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Benefícios Mensais (R$)</Label>
            <Input
              type="number"
              value={formData.beneficios_mensais || ''}
              onChange={(e) => handleChange('beneficios_mensais', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Carga Horária Mensal</Label>
            <Input
              type="number"
              value={formData.horas_mensais || ''}
              onChange={(e) => handleChange('horas_mensais', Number(e.target.value))}
            />
          </div>

          <div className="col-span-1 md:col-span-2 mt-2 font-semibold text-slate-700 border-b pb-2">
            Produtividade & Desempenho
          </div>

          <div className="space-y-2">
            <Label>Receita Gerada Mensal (R$)</Label>
            <Input
              type="number"
              value={formData.receita_gerada || ''}
              onChange={(e) => handleChange('receita_gerada', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Meta de Receita (R$)</Label>
            <Input
              type="number"
              value={formData.meta_receita || ''}
              onChange={(e) => handleChange('meta_receita', Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
