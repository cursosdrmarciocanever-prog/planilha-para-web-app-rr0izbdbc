import { Funcionario } from '@/hooks/use-funcionarios'
import { Edit, Trash2, AlertTriangle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  funcionarios: Funcionario[]
  onEdit: (f: Funcionario) => void
  onDelete: (id: string) => void
}

export function FuncionarioList({ funcionarios, onEdit, onDelete }: Props) {
  if (funcionarios.length === 0) {
    return (
      <div className="bg-white border rounded-xl min-h-[300px] flex flex-col items-center justify-center p-8">
        <p className="text-slate-500 mb-4">Nenhum colaborador cadastrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {funcionarios.map((f) => {
        const custoMensal =
          (f.salario_base || 0) * (1 + (f.encargos_percentual || 0) / 100) +
          (f.beneficios_mensais || 0)
        const custoHora = (f.horas_mensais || 0) > 0 ? custoMensal / f.horas_mensais : 0
        const custoReceitaRatio = (f.receita_gerada || 0) > 0 ? custoMensal / f.receita_gerada : 0
        const limiteExcedido = (f.receita_gerada || 0) > 0 && custoReceitaRatio > 0.3

        const brl = (v: number) =>
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

        return (
          <div
            key={f.id}
            className={`p-6 rounded-xl border relative group transition-all ${
              limiteExcedido
                ? 'border-red-300 bg-red-50/50'
                : 'border-slate-200 bg-white hover:shadow-md'
            }`}
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                onClick={() => onEdit(f)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:bg-red-50"
                onClick={() => onDelete(f.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 pr-16">{f.nome}</h3>
                <p className="text-xs text-slate-500">{f.setor || 'Sem setor'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Custo Total:</span>
                <span className="font-semibold text-slate-900">{brl(custoMensal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Custo / Hora:</span>
                <span className="font-semibold text-slate-900">{brl(custoHora)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receita Gerada:</span>
                <span className="font-semibold text-green-600">{brl(f.receita_gerada || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Custo / Receita:</span>
                <span
                  className={`font-semibold ${limiteExcedido ? 'text-red-600' : 'text-slate-900'}`}
                >
                  {(f.receita_gerada || 0) > 0 ? (custoReceitaRatio * 100).toFixed(1) + '%' : 'N/A'}
                </span>
              </div>
            </div>

            {limiteExcedido && (
              <div className="mt-4 flex items-start gap-2 bg-red-100 text-red-700 p-2 text-xs rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Alerta: O custo excede a marca de 30% da receita gerada pelo colaborador.
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
