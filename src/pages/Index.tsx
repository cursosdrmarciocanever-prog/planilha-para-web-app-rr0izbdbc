import { Link } from 'react-router-dom'
import { FileSpreadsheet, MoreVertical, Plus, Calendar, Activity } from 'lucide-react'
import { useAppStore } from '@/store/main'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Index() {
  const { projects } = useAppStore()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pronto para Dev':
        return 'bg-emerald-500 hover:bg-emerald-600'
      case 'Documentado':
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-amber-500 hover:bg-amber-600'
    }
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard de Projetos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a transformação de planilhas em sistemas web.
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Importar Planilha
        </Button>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <Input placeholder="Buscar projetos..." className="bg-white/70" />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card">
          <img
            src="https://img.usecurling.com/p/300/250?q=empty%20box&color=indigo"
            alt="Vazio"
            className="w-64 mb-6 rounded-lg opacity-80"
          />
          <h2 className="text-xl font-semibold">Nenhum projeto encontrado</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Comece importando sua primeira planilha para iniciar a análise arquitetural.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} to={`/p/${project.id}/estrutura`} className="block group">
              <Card className="glass-card h-full transition-transform duration-200 hover:scale-[1.02] hover:border-primary/30">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {project.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar Detalhes</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Excluir Projeto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Progresso da Análise</span>
                      <span className="font-bold">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50 flex justify-between items-center bg-slate-50/50 rounded-b-xl">
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.updatedAt}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
