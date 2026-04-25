import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createLead, fetchCampaigns } from '@/services/crm'
import type { CrmCampaign } from '@/types/crm'
import {
  LEAD_SOURCES,
  CLASSIFICATION_OPTIONS,
  INTEREST_OPTIONS,
  INCOME_RANGES,
  URGENCY_OPTIONS,
} from '@/types/crm'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function NewLeadDialog({ open, onOpenChange, onCreated }: Props) {
  const [campaigns, setCampaigns] = useState<CrmCampaign[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    age: '',
    gender: '',
    city: '',
    state: '',
    source: 'manual',
    campaign_id: '',
    classification: 'frio',
    interest: '',
    monthly_income_range: '',
    urgency: '',
    health_goals: '',
    notes: '',
  })

  useEffect(() => {
    if (open) {
      fetchCampaigns().then(setCampaigns).catch(console.error)
    }
  }, [open])

  function resetForm() {
    setForm({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      age: '',
      gender: '',
      city: '',
      state: '',
      source: 'manual',
      campaign_id: '',
      classification: 'frio',
      interest: '',
      monthly_income_range: '',
      urgency: '',
      health_goals: '',
      notes: '',
    })
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      setSaving(true)
      await createLead({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        city: form.city || null,
        state: form.state || null,
        source: form.source as any,
        campaign_id: form.campaign_id || null,
        classification: form.classification as any,
        interest: form.interest || null,
        monthly_income_range: form.monthly_income_range || null,
        urgency: form.urgency || null,
        health_goals: form.health_goals || null,
        notes: form.notes || null,
      })
      toast.success('Lead criado com sucesso!')
      resetForm()
      onOpenChange(false)
      onCreated()
    } catch (err) {
      toast.error('Erro ao criar lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(44) 99999-9999"
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="5544999999999"
              />
            </div>
            <div>
              <Label>Idade</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Maringá"
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="PR"
              />
            </div>
          </div>

          {/* Source & Campaign */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Origem</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Campanha</Label>
              <Select
                value={form.campaign_id}
                onValueChange={(v) => setForm({ ...form, campaign_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Qualification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Classificação</Label>
              <Select
                value={form.classification}
                onValueChange={(v) => setForm({ ...form, classification: v })}
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
              <Label>Interesse</Label>
              <Select
                value={form.interest}
                onValueChange={(v) => setForm({ ...form, interest: v })}
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
                value={form.monthly_income_range}
                onValueChange={(v) => setForm({ ...form, monthly_income_range: v })}
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
              <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
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
          </div>

          <div>
            <Label>Objetivos de Saúde</Label>
            <Textarea
              value={form.health_goals}
              onChange={(e) => setForm({ ...form, health_goals: e.target.value })}
              rows={2}
              placeholder="Ex: Emagrecimento, avaliação hormonal..."
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Notas adicionais..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Criando...' : 'Criar Lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
