import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileSpreadsheet,
  GitBranch,
  Settings2,
  Database,
  LayoutTemplate,
  PlusCircle,
  FolderOpen,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function AppSidebar() {
  const location = useLocation()
  const match = location.pathname.match(/\/p\/([^/]+)/)
  const projectId = match ? match[1] : null

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
            SA
          </div>
          <span className="truncate font-semibold text-lg tracking-tight">SheetArch</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Espaço de Trabalho</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/">
                  <FolderOpen />
                  <span>Meus Projetos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/" onClick={(e) => e.preventDefault()}>
                  <PlusCircle />
                  <span>Nova Transformação</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {projectId && (
          <SidebarGroup>
            <SidebarGroupLabel>Framework (Projeto Atual)</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.includes('/estrutura')}>
                  <Link to={`/p/${projectId}/estrutura`}>
                    <FileSpreadsheet />
                    <span>1. Análise Estrutural</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.includes('/regras')}>
                  <Link to={`/p/${projectId}/regras`}>
                    <GitBranch />
                    <span>2. Regras de Negócio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.includes('/funcoes')}>
                  <Link to={`/p/${projectId}/funcoes`}>
                    <Settings2 />
                    <span>3. Funcionalidades</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.includes('/dados')}>
                  <Link to={`/p/${projectId}/dados`}>
                    <Database />
                    <span>4. Modelo de Dados</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.includes('/telas')}>
                  <Link to={`/p/${projectId}/telas`}>
                    <LayoutTemplate />
                    <span>5. Spec de Telas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-3 border-t border-sidebar-border mt-auto">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium">Arquiteta Sênior</span>
            <span className="text-xs text-muted-foreground truncate">arq@empresa.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
