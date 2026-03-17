import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/50 backdrop-blur-sm px-4 lg:hidden">
            <SidebarTrigger />
            <span className="font-semibold text-sm">SheetArch</span>
          </header>
          <main className="flex-1 p-4 md:p-8 md:pt-6 w-full max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
