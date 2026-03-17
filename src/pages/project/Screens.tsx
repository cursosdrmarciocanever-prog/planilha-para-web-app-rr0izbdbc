import { useOutletContext } from 'react-router-dom'
import { LayoutTemplate, Table2, MousePointerSquareDashed, ArrowRight } from 'lucide-react'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardChart } from '@/components/project/DashboardChart'

export default function Screens() {
  const { project } = useOutletContext<{ project: Project }>()

  const mainEntity = project.entities[0]

  return (
    <div className="space-y-6 mb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">5. Especificação de Telas</h2>
        <p className="text-muted-foreground text-sm">
          Preview visual do sistema gerado (Wireframes interativos).
        </p>
      </div>

      <div className="space-y-8">
        {/* Dashboard Preview */}
        <section>
          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
            <LayoutTemplate className="w-5 h-5 text-indigo-500" /> Tela: Dashboard Principal
          </h3>
          <div className="glass-card p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="shadow-sm border-white">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Entidades</p>
                  <h4 className="text-3xl font-bold text-slate-900">{project.entities.length}</h4>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-white">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">Status do Projeto</p>
                  <h4 className="text-xl font-bold text-emerald-600 mt-2">{project.status}</h4>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-white">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">Exportar Restante</p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-4 mb-1">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-sm border-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Fluxo de Dados (Mock)</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardChart />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Listagem Preview */}
        {mainEntity && (
          <section>
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <Table2 className="w-5 h-5 text-indigo-500" /> Tela: Listagem de {mainEntity.name}
            </h3>
            <Card className="glass-card overflow-hidden">
              <div className="border-b bg-white p-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="h-8 w-64 bg-slate-100 rounded-md border border-slate-200 flex items-center px-3 text-sm text-slate-400">
                    Buscar...
                  </div>
                  <div className="h-8 w-24 bg-slate-100 rounded-md border border-slate-200"></div>
                </div>
                <div className="h-8 w-32 bg-indigo-600 rounded-md text-white flex items-center justify-center text-sm font-medium shadow-sm">
                  + Novo Registro
                </div>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      {mainEntity.fields.slice(0, 5).map((f) => (
                        <th key={f.id} className="px-4 py-3 border-b">
                          {f.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((row) => (
                      <tr key={row} className="border-b border-slate-100 bg-white">
                        {mainEntity.fields.slice(0, 5).map((f, colIdx) => (
                          <td key={f.id} className="px-4 py-3">
                            {colIdx === 0 ? (
                              <span className="font-medium text-slate-900">Exemplo {row}</span>
                            ) : (
                              <div className="h-4 bg-slate-100 rounded w-full max-w-[80%]"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}
