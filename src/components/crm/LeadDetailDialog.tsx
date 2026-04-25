import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Calendar,
  Bot,
  Flame,
  ThermometerSun,
  Snowflake,
  Clock,
  Send,
  Save,
  History,
  Target,
  DollarSign,
  Heart,
  FileText,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  updateLead,
  updateLeadStage,
  fetchActivities,
  createActivity,
  sendWhatsAppToLead,
} from '@/services/crm'
import type { CrmLead, CrmLeadActivity, PipelineStage } from '@/types/crm'
import {
  PIPELINE_STAGES,
  LEAD_SOURCES,
  CLASSIFICATION_OPTIONS,
  INTEREST_OPTIONS,
  INCOME_RANGES,
  URGENCY_OPTIONS,
} from '@/types/crm'

interface Props {
  lead: CrmLead
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function LeadDetailDialog({ lead, open, onOpenChange, onUpdate }: Props) {
  const [editedLead, setEditedLead] = useState<CrmLead>(lead)
  const [activities, setActivities] = useState<CrmLeadActivity[]>([])
  const [newNote, setNewNote] = useState('')
  const [whatsappMsg, setWhatsappMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [sendingWa, setSendingWa] = useState(false)

  useEffect(() => {
    setEditedLead(lead)
    if (open) {
      loadActivities()
    }
  }, [lead, open])

  async function loadActivities() {
    try {
      const data = await fetchActivities(lead.id)
      setActivities(data)
    } catch (err) {
      console.error('Erro ao carregar atividades:', err)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      await updateLead(lead.id, {
        name: editedLead.name,
        email: editedLead.email,
        phone: editedLead.phone,
        whatsapp: editedLead.whatsapp,
        age: editedLead.age,
        gender: editedLead.gender,
        city: editedLead.city,
        state: editedLead.state,
        interest: editedLead.interest,
        monthly_income_range: editedLead.monthly_income_range,
        urgency: editedLead.urgency,
        has_health_plan: editedLead.has_health_plan,
        health_goals: editedLead.health_goals,
        classification: editedLead.classification,
        priority: editedLead.priority,
        score: editedLead.score,
        assigned_to: editedLead.assigned_to,
        estimated_value: editedLead.estimated_value,
        notes: editedLead.notes,
        tags: editedLead.tags,
      })
      toast.success('Lead atualizado')
      onUpdate()
    } catch (err) {
      toast.error('Erro ao salvar lead')
    } finally {
      setSaving(false)
    }
  }

  async function handleStageChange(stage: PipelineStage) {
    try {
      await updateLeadStage(lead.id, stage)
      setEditedLead({ ...editedLead, pipeline_stage: stage })
      toast.success(`Movido para "${PIPELINE_STAGES.find((s) => s.key === stage)?.label}"`)
      loadActivities()
      onUpdate()
    } catch (err) {
      toast.error('Erro ao mover lead')
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return
    try {
      await createActivity({
        lead_id: lead.id,
        type: 'note',
        title: 'Nota adicionada',
        description: newNote,
      })
      setNewNote('')
      loadActivities()
      toast.success('Nota adicionada')
    } catch (err) {
      toast.error('Erro ao adicionar nota')
    }
  }

  async function handleSendWhatsApp() {
    if (!whatsappMsg.trim()) return
    try {
      setSendingWa(true)
      await sendWhatsAppToLead(lead.id, whatsappMsg)
      setWhatsappMsg('')
      loadActivities()
      toast.success('Mensagem enviada via WhatsApp')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar mensagem')
    } finally {
      setSendingWa(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-green-500" />
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-cyan-500" />
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-purple-500" />
      case 'stage_change':
        return <Target className="w-3.5 h-3.5 text-orange-500" />
      case 'ai_qualification':
        return <Bot className="w-3.5 h-3.5 text-purple-500" />
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {editedLead.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {editedLead.ai_qualified && (
                <Badge className="bg-purple-50 text-purple-600 border-purple-200 gap-1">
                  <Bot className="w-3 h-3" />
                  Qualificado por IA
                </Badge>
              )}
              <Badge
                className={
                  PIPELINE_STAGES.find((s) => s.key === editedLead.pipeline_stage)?.bgColor +
                  ' ' +
                  PIPELINE_STAGES.find((s) => s.key === editedLead.pipeline_stage)?.color +
                  ' border'
                }
              >
                {PIPELINE_STAGES.find((s) => s.key === editedLead.pipeline_stage)?.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="qualification">Qualificação</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="activities">Histórico ({activities.length})</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[55vh] mt-4">
            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={editedLead.name}
                    onChange={(e) => setEditedLead({ ...editedLead, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editedLead.email || ''}
                    onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={editedLead.phone || ''}
                    onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={editedLead.whatsapp || ''}
                    onChange={(e) => setEditedLead({ ...editedLead, whatsapp: e.target.value })}
                    placeholder="5544999999999"
                  />
                </div>
                <div>
                  <Label>Idade</Label>
                  <Input
                    type="number"
                    value={editedLead.age || ''}
                    onChange={(e) =>
                      setEditedLead({
                        ...editedLead,
                        age: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Gênero</Label>
                  <Select
                    value={editedLead.gender || ''}
                    onValueChange={(v) => setEditedLead({ ...editedLead, gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={editedLead.city || ''}
                    onChange={(e) => setEditedLead({ ...editedLead, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input
                    value={editedLead.state || ''}
                    onChange={(e) => setEditedLead({ ...editedLead, state: e.target.value })}
                    placeholder="PR"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Etapa do Pipeline</Label>
                  <Select
                    value={editedLead.pipeline_stage}
                    onValueChange={(v) => handleStageChange(v as PipelineStage)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Atribuído a</Label>
                  <Input
                    value={editedLead.assigned_to || ''}
                    onChange={(e) => setEditedLead({ ...editedLead, assigned_to: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <Label>Valor Estimado (R$)</Label>
                  <Input
                    type="number"
                    value={editedLead.estimated_value || ''}
                    onChange={(e) =>
                      setEditedLead({
                        ...editedLead,
                        estimated_value: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Origem</Label>
                  <Input
                    value={
                      LEAD_SOURCES.find((s) => s.key === editedLead.source)?.label ||
                      editedLead.source
                    }
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={editedLead.notes || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                  rows={3}
                  placeholder="Notas sobre o lead..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </TabsContent>

            {/* Qualification Tab */}
            <TabsContent value="qualification" className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Classificação</Label>
                  <Select
                    value={editedLead.classification}
                    onValueChange={(v: any) => setEditedLead({ ...editedLead, classification: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSIFICATION_OPTIONS.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Score (0-100)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={editedLead.score}
                    onChange={(e) =>
                      setEditedLead({
                        ...editedLead,
                        score: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Interesse Principal</Label>
                  <Select
                    value={editedLead.interest || ''}
                    onValueChange={(v) => setEditedLead({ ...editedLead, interest: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEREST_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Faixa de Renda</Label>
                  <Select
                    value={editedLead.monthly_income_range || ''}
                    onValueChange={(v) => setEditedLead({ ...editedLead, monthly_income_range: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urgência</Label>
                  <Select
                    value={editedLead.urgency || ''}
                    onValueChange={(v) => setEditedLead({ ...editedLead, urgency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={editedLead.priority}
                    onValueChange={(v: any) => setEditedLead({ ...editedLead, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Objetivos de Saúde</Label>
                <Textarea
                  value={editedLead.health_goals || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, health_goals: e.target.value })}
                  rows={3}
                  placeholder="Quais são os objetivos de saúde do lead..."
                />
              </div>

              {/* AI Summary */}
              {editedLead.ai_summary && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Análise da IA</span>
                    {editedLead.ai_score && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                        Score IA: {editedLead.ai_score}/100
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-purple-700">{editedLead.ai_summary}</p>
                  {editedLead.ai_qualified_at && (
                    <p className="text-xs text-purple-500 mt-2">
                      Qualificado em {new Date(editedLead.ai_qualified_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </TabsContent>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="space-y-4 pr-4">
              {!editedLead.whatsapp ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Este lead não possui número de WhatsApp cadastrado.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adicione o WhatsApp na aba "Informações" para enviar mensagens.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        WhatsApp: {editedLead.whatsapp}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs text-green-700">
                      <div>
                        <span className="font-medium">Status:</span> {editedLead.whatsapp_status}
                      </div>
                      <div>
                        <span className="font-medium">Mensagens:</span> {editedLead.total_messages}
                      </div>
                      <div>
                        <span className="font-medium">Último contato:</span>{' '}
                        {editedLead.last_contact_at
                          ? new Date(editedLead.last_contact_at).toLocaleDateString('pt-BR')
                          : 'Nunca'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Enviar Mensagem</Label>
                    <div className="flex gap-2 mt-1">
                      <Textarea
                        value={whatsappMsg}
                        onChange={(e) => setWhatsappMsg(e.target.value)}
                        rows={3}
                        placeholder="Digite a mensagem para enviar via WhatsApp..."
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleSendWhatsApp}
                        disabled={sendingWa || !whatsappMsg.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendingWa ? 'Enviando...' : 'Enviar WhatsApp'}
                      </Button>
                    </div>
                  </div>

                  {/* Quick messages */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Mensagens Rápidas</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[
                        'Olá! Tudo bem? Vi que você demonstrou interesse na Clínica Canever. Posso te ajudar?',
                        'Gostaria de agendar uma avaliação? Temos horários disponíveis esta semana.',
                        'Obrigado pelo interesse! Nossa equipe entrará em contato em breve.',
                      ].map((msg, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5 whitespace-normal text-left"
                          onClick={() => setWhatsappMsg(msg)}
                        >
                          {msg.substring(0, 50)}...
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4 pr-4">
              {/* Add note */}
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Adicionar nota..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button variant="outline" onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              {activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma atividade registrada</p>
                </div>
              )}

              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 rounded-lg border bg-muted/20">
                    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      )}
                      {activity.created_by && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          por {activity.created_by}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
