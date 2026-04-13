import { useOutletContext } from 'react-router-dom'
import { Plus, Save, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Project } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export default function Rules() {
  const { project } = useOutletContext<{ project: Project }>()
  const { toast } = useToast()

  const handleSave = () => {
    toast({ title: 'Regras Salvas', description: 'Lógicas de negócio documentadas com sucesso.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">2. Regras de Negócio</h2>
          <p className="text-muted-foreground text-sm">
            Documente validações, cálculos complexos e fluxos de status (Workflows).
          </p>
        </div>
        <Button variant="outline" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Salvar Etapa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card col-span-1 md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Design de Workflow (Status)</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                <Plus className="w-3 h-3" /> Novo Fluxo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  Entidade: Movimentações
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-sm bg-white shadow-sm border-slate-300"
                  >
                    Pendente
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Em Processamento
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <Badge
                    variant="default"
                    className="px-3 py-1 text-sm bg-emerald-500 hover:bg-emerald-600"
                  >
                    Concluído
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Regra: Apenas administradores podem alterar de 'Em Processamento' para
                  'Concluído'.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Regras de Validação</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-800">Preço de Venda Positivo</h4>
                <p className="text-xs text-slate-600 mt-1">
                  O campo 'Preço Venda' na entidade Produtos deve ser sempre maior que zero.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-800">SKU Único Global</h4>
                <p className="text-xs text-slate-600 mt-1">
                  O sistema deve checar duplicidade de SKU antes da inserção no banco.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Campos Calculados</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {project.entities
              .flatMap((e) => e.fields)
              .filter((f) => f.formula)
              .map((f) => (
                <div key={f.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-800">{f.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Auto-calculado
                    </Badge>
                  </div>
                  <code className="block bg-slate-900 text-emerald-400 p-2 rounded text-xs overflow-x-auto">
                    {f.formula}
                  </code>
                </div>
              ))}
            {project.entities.flatMap((e) => e.fields).filter((f) => f.formula).length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhuma fórmula mapeada nesta etapa.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
