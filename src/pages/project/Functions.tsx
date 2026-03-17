import { useOutletContext } from 'react-router-dom'
import { Save, Search, TableProperties, BarChart3 } from 'lucide-react'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function Functions() {
  const { project } = useOutletContext<{ project: Project }>()
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Funcionalidades Salvas',
      description: 'As permissões de CRUD e Dashboard foram definidas.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">3. Funcionalidades do Sistema</h2>
          <p className="text-muted-foreground text-sm">
            Defina operações CRUD, filtros de busca e indicadores chave (KPIs).
          </p>
        </div>
        <Button variant="outline" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Salvar Etapa
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-indigo-500" />
              Matriz de Permissões (CRUD)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Entidade</th>
                    <th className="px-4 py-3 text-center">Criar (C)</th>
                    <th className="px-4 py-3 text-center">Ler (R)</th>
                    <th className="px-4 py-3 text-center">Atualizar (U)</th>
                    <th className="px-4 py-3 text-center">Deletar (D)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.entities.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{e.name}</td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox defaultChecked />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox defaultChecked disabled />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox defaultChecked />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Checkbox />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-500" />
                Busca Global
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground mb-3">
                Selecione os campos que estarão disponíveis na busca rápida.
              </p>
              {project.entities[0]?.fields.slice(0, 3).map((f) => (
                <div key={f.id} className="flex items-center space-x-2">
                  <Switch
                    id={`search-${f.id}`}
                    defaultChecked={f.name === 'SKU' || f.name === 'Nome'}
                  />
                  <Label htmlFor={`search-${f.id}`} className="text-sm font-medium">
                    {project.entities[0].name} - {f.name}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                KPIs do Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
                <p className="text-sm font-semibold">Total de Estoque</p>
                <p className="text-xs text-slate-500">Soma(Produtos.Quantidade)</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
                <p className="text-sm font-semibold">Valor em Produtos</p>
                <p className="text-xs text-slate-500">Soma(Produtos.Preço Venda * Quantidade)</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-primary border border-dashed border-primary/30 mt-2"
              >
                Adicionar Métrica
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
