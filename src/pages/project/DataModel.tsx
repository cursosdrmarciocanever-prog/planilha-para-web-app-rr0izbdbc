import { useOutletContext } from 'react-router-dom'
import { Save, Code2, Database } from 'lucide-react'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function DataModel() {
  const { project } = useOutletContext<{ project: Project }>()
  const { toast } = useToast()

  const handleSave = () => {
    toast({ title: 'Modelo de Dados Salvo', description: 'Esquema relacional confirmado.' })
  }

  const generateSQL = () => {
    let sql = `-- Auto-generated schema for ${project.name}\n\n`
    project.entities.forEach((e) => {
      sql += `CREATE TABLE ${e.name.toLowerCase()} (\n`
      sql += `  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n`
      e.fields.forEach((f, idx) => {
        let type = 'VARCHAR(255)'
        if (f.type === 'Número') type = 'INTEGER'
        if (f.type === 'Moeda') type = 'DECIMAL(12,2)'
        if (f.type === 'Data') type = 'TIMESTAMP'
        if (f.type === 'Booleano') type = 'BOOLEAN'

        let constraints = f.required ? ' NOT NULL' : ''
        if (f.isUnique) constraints += ' UNIQUE'

        const isLast = idx === e.fields.length - 1
        sql += `  ${f.name.toLowerCase().replace(/ /g, '_')} ${type}${constraints}${isLast ? '' : ','}\n`
      })
      sql += `);\n\n`
    })
    return sql
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">4. Modelo de Dados</h2>
          <p className="text-muted-foreground text-sm">
            Visualização do esquema de banco de dados inferido.
          </p>
        </div>
        <Button variant="outline" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Salvar Etapa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Diagrama Relacional Simplificado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 overflow-x-auto">
            <div className="flex items-center gap-6 min-w-max p-4">
              {project.entities.map((e, i) => (
                <div key={e.id} className="flex items-center gap-6">
                  <div className="w-64 border border-slate-200 shadow-sm rounded-lg bg-white overflow-hidden">
                    <div className="bg-indigo-600 text-white font-semibold text-sm px-4 py-2 flex justify-between">
                      {e.name}
                      <span className="text-indigo-200 text-xs font-normal font-mono">PK</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {e.fields.slice(0, 4).map((f) => (
                        <div key={f.id} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700">{f.name}</span>
                          <span className="text-slate-400">{f.type}</span>
                        </div>
                      ))}
                      {e.fields.length > 4 && (
                        <div className="text-xs text-center text-slate-400 pt-1">
                          +{e.fields.length - 4} campos
                        </div>
                      )}
                    </div>
                  </div>
                  {i < project.entities.length - 1 && (
                    <div className="flex flex-col items-center text-slate-300">
                      <span className="text-[10px] mb-1">1:N</span>
                      <div className="w-8 border-t-2 border-dashed border-slate-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2 bg-slate-900 text-slate-50 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
              <Code2 className="w-5 h-5 text-emerald-400" />
              Esquema SQL Gerado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <pre className="p-6 text-sm font-mono text-emerald-300 overflow-auto">
              <code>{generateSQL()}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
