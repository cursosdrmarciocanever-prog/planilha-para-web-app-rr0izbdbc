import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Building,
  CreditCard,
  UserCircle,
  LogOut,
  User,
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

const navItems = [
  { label: 'Painel', path: '/', icon: LayoutDashboard },
  { label: 'diário', path: '/diario', icon: Calendar },
  { label: 'Raio-X Financeiro', path: '/raio-x', icon: TrendingUp },
  { label: 'Custo Funcionário', path: '/custo', icon: Users },
  { label: 'Precisão', path: '/precisao', icon: Target },
  { label: 'Taxa de Sala', path: '/taxa', icon: Building },
  { label: 'Plano Assinar', path: '/plano', icon: CreditCard },
  { label: 'Meu perfil', path: '/perfil', icon: UserCircle },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r-0 bg-[#0b1121]">
      <SidebarHeader className="pt-8 pb-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl font-light tracking-tighter text-[#3b5bdb]">G</span>
            <span className="text-4xl font-semibold tracking-tighter text-slate-200 -ml-1">M</span>
          </div>
          <h2 className="text-lg font-light tracking-widest text-slate-200 uppercase mt-1">
            Método GM
          </h2>
          <p className="text-[9px] tracking-[0.2em] text-slate-500 uppercase mt-1">Growth Médico</p>
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
                    'h-12 rounded-xl px-4 justify-start text-[15px] transition-all duration-200',
                    isActive
                      ? 'bg-[#3b5bdb] hover:bg-[#364fc7] text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                  )}
                >
                  <Link to={item.path}>
                    <item.icon className="w-5 h-5 mr-3 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 pb-6">
        <div className="bg-[#151e32] p-4 rounded-2xl flex flex-col gap-4 border border-slate-800/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-[#3b5bdb] rounded-xl shrink-0">
              <AvatarFallback className="bg-[#3b5bdb] text-white rounded-xl">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-200 truncate">
                MARCIO RENATÓ M...
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 truncate mt-0.5">
                CLÍNICA CANEVER
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 px-2 h-9"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
