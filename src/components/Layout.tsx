import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

export default function Layout() {
  return (
    <div
      style={
        {
          '--sidebar-background': '222 47% 11%', // Dark background
          '--sidebar-foreground': '210 40% 98%',
          '--sidebar-border': '222 47% 11%', // Hide border
          '--sidebar-accent': '216 34% 17%',
          '--sidebar-accent-foreground': '210 40% 98%',
        } as React.CSSProperties
      }
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-[#f8fafc] min-h-screen">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4 lg:hidden">
            <SidebarTrigger />
            <span className="font-semibold text-sm">Método GM</span>
          </header>
          <main className="flex-1 w-full mx-auto pb-12">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
