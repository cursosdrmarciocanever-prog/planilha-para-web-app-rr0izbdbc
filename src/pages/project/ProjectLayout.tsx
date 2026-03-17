import { useParams, Outlet, Navigate, Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useAppStore } from '@/store/main'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useToast } from '@/hooks/use-toast'

export default function ProjectLayout() {
  const { id } = useParams()
  const { projects } = useAppStore()
  const { toast } = useToast()

  const project = projects.find((p) => p.id === id)

  if (!project) return <Navigate to="/" replace />

  const handleExport = () => {
    toast({
      title: 'Especificação Exportada',
      description: 'O documento Markdown foi gerado com sucesso.',
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <header className="glass-card p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Projetos</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
        </div>
        <Button onClick={handleExport} className="gap-2 w-full sm:w-auto shadow-sm">
          <Download className="w-4 h-4" /> Exportar Blueprint
        </Button>
      </header>

      <div className="animate-fade-in-up">
        <Outlet context={{ project }} />
      </div>
    </div>
  )
}
