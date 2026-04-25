import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Megaphone,
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Pause,
  Play,
  Archive,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } from '@/services/crm'
import type { CrmCampaign, CampaignStatus } from '@/types/crm'

export function CrmCampaigns() {
  const [campaigns, setCampaigns] = useState<CrmCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CrmCampaign | null>(null)
  const [form, setForm] = useState({
    name: '',
    platform: 'meta_ads',
    campaign_id: '',
    form_id: '',
    budget: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    notes: '',
  })

  useEffect(() => {
    loadCampaigns()
  }, [])

  async function loadCampaigns() {
    try {
      setLoading(true)
      const data = await fetchCampaigns()
      setCampaigns(data)
    } catch (err) {
      toast.error('Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditing(null)
    setForm({
      name: '',
      platform: 'meta_ads',
      campaign_id: '',
      form_id: '',
      budget: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      notes: '',
    })
    setDialogOpen(true)
  }

  function openEdit(campaign: CrmCampaign) {
    setEditing(campaign)
    setForm({
      name: campaign.name,
      platform: campaign.platform,
      campaign_id: campaign.campaign_id || '',
      form_id: campaign.form_id || '',
      budget: campaign.budget?.toString() || '',
      utm_source: campaign.utm_source || '',
      utm_medium: campaign.utm_medium || '',
      utm_campaign: campaign.utm_campaign || '',
      notes: campaign.notes || '',
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Nome da campanha é obrigatório')
      return
    }

    try {
      const payload: Partial<CrmCampaign> = {
        name: form.name,
        platform: form.platform,
        campaign_id: form.campaign_id || null,
        form_id: form.form_id || null,
        budget: form.budget ? parseFloat(form.budget) : 0,
        utm_source: form.utm_source || null,
        utm_medium: form.utm_medium || null,
        utm_campaign: form.utm_campaign || null,
        notes: form.notes || null,
      }

      if (editing) {
        await updateCampaign(editing.id, payload)
        toast.success('Campanha atualizada')
      } else {
        await createCampaign(payload)
        toast.success('Campanha criada')
      }

      setDialogOpen(false)
      loadCampaigns()
    } catch (err) {
      toast.error('Erro ao salvar campanha')
    }
  }

  async function handleStatusChange(id: string, status: CampaignStatus) {
    try {
      await updateCampaign(id, { status })
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
      toast.success(
        `Campanha ${status === 'active' ? 'ativada' : status === 'paused' ? 'pausada' : 'arquivada'}`,
      )
    } catch (err) {
      toast.error('Erro ao atualizar status')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCampaign(id)
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
      toast.success('Campanha removida')
    } catch (err) {
      toast.error('Erro ao remover campanha')
    }
  }

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-600 border-green-200">Ativa</Badge>
      case 'paused':
        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">Pausada</Badge>
      case 'archived':
        return <Badge className="bg-gray-50 text-gray-600 border-gray-200">Arquivada</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{campaigns.length} campanhas</p>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-32 mb-4" />
                <div className="h-3 bg-muted rounded w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && campaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira campanha para começar a rastrear leads do Meta Ads.
            </p>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Campanha
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    {campaign.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status as CampaignStatus)}
                    <Badge variant="outline" className="text-xs capitalize">
                      {campaign.platform.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(campaign)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {campaign.status !== 'active' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'active')}>
                        <Play className="w-4 h-4 mr-2" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'active' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'paused')}>
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'archived')}>
                      <Archive className="w-4 h-4 mr-2" />
                      Arquivar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-lg font-bold">{campaign.total_leads}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <UserCheck className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-lg font-bold">{campaign.total_qualified}</p>
                  <p className="text-[10px] text-muted-foreground">Qualificados</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-lg font-bold">{campaign.total_converted}</p>
                  <p className="text-[10px] text-muted-foreground">Convertidos</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold">
                    {campaign.cost_per_lead > 0 ? `R$${campaign.cost_per_lead.toFixed(0)}` : '-'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">CPL</p>
                </div>
              </div>
              {campaign.utm_campaign && (
                <p className="text-xs text-muted-foreground mt-3 truncate">
                  UTM: {campaign.utm_campaign}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Campanha *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Campanha Emagrecimento Abril"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plataforma</Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) => setForm({ ...form, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta_ads">Meta Ads</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orçamento (R$)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ID Campanha (Meta)</Label>
                <Input
                  value={form.campaign_id}
                  onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}
                  placeholder="ID do Meta Ads"
                />
              </div>
              <div>
                <Label>ID Formulário (Meta)</Label>
                <Input
                  value={form.form_id}
                  onChange={(e) => setForm({ ...form, form_id: e.target.value })}
                  placeholder="ID do Lead Form"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>UTM Source</Label>
                <Input
                  value={form.utm_source}
                  onChange={(e) => setForm({ ...form, utm_source: e.target.value })}
                  placeholder="facebook"
                />
              </div>
              <div>
                <Label>UTM Medium</Label>
                <Input
                  value={form.utm_medium}
                  onChange={(e) => setForm({ ...form, utm_medium: e.target.value })}
                  placeholder="cpc"
                />
              </div>
              <div>
                <Label>UTM Campaign</Label>
                <Input
                  value={form.utm_campaign}
                  onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })}
                  placeholder="emagrecimento"
                />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas sobre a campanha..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
