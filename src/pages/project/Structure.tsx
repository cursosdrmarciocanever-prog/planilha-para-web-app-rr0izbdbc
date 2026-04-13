import { useOutletContext } from 'react-router-dom'
import { Plus, Save, Info } from 'lucide-react'
import { Project, Field } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function Structure() {
  const { project } = useOutletContext<{ project: Project }>()
  const { toast } = useToast()

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Texto: 'bg-slate-100 text-slate-800 border-slate-200',
      Número: 'bg-blue-100 text-blue-800 border-blue-200',
      Data: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Moeda: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Enum: 'bg-amber-100 text-amber-800 border-amber-200',
      Booleano: 'bg-purple-100 text-purple-800 border-purple-200',
    }
    return colors[type] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  const handleSave = () => {
    toast({ title: 'Estrutura Salva', description: 'O mapeamento das entidades foi atualizado.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">1. Análise Estrutural</h2>
          <p className="text-muted-foreground text-sm">
            Mapeie as abas da planilha para entidades de negócio e defina seus campos.
          </p>
        </div>
        <Button variant="outline" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Salvar Etapa
        </Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <Tabs defaultValue={project.entities[0]?.id} className="w-full">
          <div className="px-6 pt-4 border-b bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Entidades (Abas)</span>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary">
                <Plus className="w-3 h-3" /> Nova Entidade
              </Button>
            </div>
            <TabsList className="bg-transparent space-x-2">
              {project.entities.map((e) => (
                <TabsTrigger
                  key={e.id}
                  value={e.id}
                  className="data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent rounded-t-lg rounded-b-none px-4 pb-2 pt-2"
                >
                  {e.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {project.entities.map((e) => (
            <TabsContent key={e.id} value={e.id} className="m-0 border-none outline-none">
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[250px]">Nome do Campo (Coluna)</TableHead>
                      <TableHead>Tipo de Dado</TableHead>
                      <TableHead>Restrições</TableHead>
                      <TableHead>Fórmula / Lógica</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {e.fields.map((f: Field) => (
                      <TableRow key={f.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{f.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(f.type)}>
                            {f.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-1">
                          {f.required && (
                            <Badge variant="secondary" className="bg-slate-100 text-xs font-normal">
                              Obrigatório
                            </Badge>
                          )}
                          {f.isUnique && (
                            <Badge variant="secondary" className="bg-slate-100 text-xs font-normal">
                              Único
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {f.formula ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200">
                              <Info className="w-3 h-3" /> {f.formula}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-primary"
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 border-t bg-slate-50">
                  <Button variant="outline" size="sm" className="gap-2 w-full border-dashed">
                    <Plus className="w-4 h-4" /> Adicionar Campo
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}
