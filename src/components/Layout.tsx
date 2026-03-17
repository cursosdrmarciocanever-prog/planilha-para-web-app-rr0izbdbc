import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent flex-1">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/40 bg-background/80 backdrop-blur-sm px-4 lg:hidden sticky top-0 z-10">
            <SidebarTrigger className="text-primary hover:text-primary/80" />
            <span className="font-bold text-sm tracking-widest uppercase text-foreground">
              Canever Financeiro
            </span>
          </header>
          <main className="w-full mx-auto pb-12">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
