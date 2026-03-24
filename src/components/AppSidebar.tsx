import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Building,
  LogOut,
  User,
  Infinity as InfinityIcon,
  Upload,
  Receipt,
  Pill,
  Activity,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

const navItems = [
  { label: 'Painel', path: '/', icon: LayoutDashboard },
  { label: 'Diário', path: '/diario', icon: Calendar },
  { label: 'Raio-X Financeiro', path: '/raio-x', icon: TrendingUp },
  { label: 'Despesas', path: '/despesas', icon: Receipt },
  { label: 'Custo Funcionário', path: '/custo', icon: Users },
  { label: 'Precisão', path: '/precisao', icon: Target },
  { label: 'Taxa de Sala', path: '/taxa', icon: Building },
  { label: 'Medicamentos', path: '/medicamentos', icon: Pill },
  { label: 'Monitoramento', path: '/monitoramento', icon: Activity },
  { label: 'Importar Dados', path: '/importar', icon: Upload },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getUserInitials = (name?: string) => {
    if (!name) return ''
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const formatRole = (role?: string) => {
    if (!role) return 'Visitante'
    if (role === 'admin') return 'Administrador'
    if (role === 'financeiro') return 'Financeiro'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="pt-8 pb-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-1 text-primary">
            <InfinityIcon className="w-12 h-12 stroke-[1.5]" />
          </div>
          <h2 className="text-[13px] text-center font-bold tracking-[0.15em] text-foreground uppercase mt-2">
            Clínica Canever
          </h2>
          <p className="text-[10px] tracking-[0.2em] text-primary font-medium uppercase mt-1">
            Financeiro
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-6">
        <SidebarMenu className="gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    'h-11 rounded-full px-5 justify-start text-[14px] transition-all duration-200',
                    isActive
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground font-medium',
                  )}
                >
                  <Link to={item.path}>
                    <item.icon className="w-4 h-4 mr-3 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 pb-6">
        <div className="bg-secondary/50 p-4 rounded-2xl flex flex-col gap-4 border border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/20 text-primary rounded-full shrink-0 border border-primary/20">
              <AvatarFallback className="bg-transparent text-primary text-sm font-bold">
                {profile?.full_name ? (
                  getUserInitials(profile.full_name)
                ) : (
                  <User className="w-5 h-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-foreground truncate">
                {profile?.full_name || 'Usuário'}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate mt-0.5">
                {formatRole(profile?.role)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-background px-4 h-10 rounded-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
