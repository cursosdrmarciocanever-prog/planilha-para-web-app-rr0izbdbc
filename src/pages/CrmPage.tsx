import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CrmDashboard } from './crm/CrmDashboard'
import { CrmPipeline } from './crm/CrmPipeline'
import { CrmLeadsList } from './crm/CrmLeadsList'
import { CrmCampaigns } from './crm/CrmCampaigns'
import { CrmSettings } from './crm/CrmSettings'
import {
  LayoutDashboard,
  Kanban,
  List,
  Megaphone,
  Settings,
} from 'lucide-react'

export default function CrmPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM - Gestão de Leads</h1>
        <p className="text-muted-foreground mt-1">
          Capture leads do Meta Ads, qualifique com IA via WhatsApp e converta em pacientes.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-background">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2 data-[state=active]:bg-background">
            <Kanban className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2 data-[state=active]:bg-background">
            <List className="w-4 h-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2 data-[state=active]:bg-background">
            <Megaphone className="w-4 h-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-background">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CrmDashboard />
        </TabsContent>
        <TabsContent value="pipeline">
          <CrmPipeline />
        </TabsContent>
        <TabsContent value="leads">
          <CrmLeadsList />
        </TabsContent>
        <TabsContent value="campaigns">
          <CrmCampaigns />
        </TabsContent>
        <TabsContent value="settings">
          <CrmSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
