import { supabase } from '@/lib/supabase/client'
import type {
  CrmLead,
  CrmCampaign,
  CrmLeadActivity,
  CrmAiConfig,
  CrmWebhookToken,
  PipelineStage,
  LeadClassification,
  LeadSource,
  CrmDashboardStats,
} from '@/types/crm'

// ============================================================
// LEADS
// ============================================================

export async function fetchLeads(filters?: {
  pipeline_stage?: PipelineStage
  classification?: LeadClassification
  source?: LeadSource
  campaign_id?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('crm_leads')
    .select('*, campaign:crm_campaigns(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.pipeline_stage) {
    query = query.eq('pipeline_stage', filters.pipeline_stage)
  }
  if (filters?.classification) {
    query = query.eq('classification', filters.classification)
  }
  if (filters?.source) {
    query = query.eq('source', filters.source)
  }
  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id)
  }
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,whatsapp.ilike.%${filters.search}%`,
    )
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: data as CrmLead[], count }
}

export async function fetchLeadById(id: string) {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*, campaign:crm_campaigns(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as CrmLead
}

export async function createLead(lead: Partial<CrmLead>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('crm_leads')
    .insert({ ...lead, user_id: user.id })
    .select()
    .single()
  if (error) throw error

  // Log activity
  await createActivity({
    lead_id: data.id,
    type: 'note',
    title: 'Lead criado',
    description: `Lead ${lead.name} criado via ${lead.source || 'manual'}`,
    created_by: user.email || 'system',
  })

  return data as CrmLead
}

export async function updateLead(id: string, updates: Partial<CrmLead>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('crm_leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  return data as CrmLead
}

export async function updateLeadStage(id: string, stage: PipelineStage, reason?: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const updates: Partial<CrmLead> = { pipeline_stage: stage }

  if (stage === 'convertido') {
    updates.converted_at = new Date().toISOString()
  }
  if (stage === 'perdido' && reason) {
    updates.lost_reason = reason
  }

  const { data, error } = await supabase
    .from('crm_leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  await createActivity({
    lead_id: id,
    type: 'stage_change',
    title: `Movido para "${stage}"`,
    description: reason || undefined,
    created_by: user.email || 'system',
  })

  return data as CrmLead
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('crm_leads').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// ACTIVITIES
// ============================================================

export async function fetchActivities(leadId: string) {
  const { data, error } = await supabase
    .from('crm_lead_activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CrmLeadActivity[]
}

export async function createActivity(activity: Partial<CrmLeadActivity>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('crm_lead_activities')
    .insert({ ...activity, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data as CrmLeadActivity
}

// ============================================================
// CAMPAIGNS
// ============================================================

export async function fetchCampaigns() {
  const { data, error } = await supabase
    .from('crm_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CrmCampaign[]
}

export async function createCampaign(campaign: Partial<CrmCampaign>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('crm_campaigns')
    .insert({ ...campaign, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data as CrmCampaign
}

export async function updateCampaign(id: string, updates: Partial<CrmCampaign>) {
  const { data, error } = await supabase
    .from('crm_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as CrmCampaign
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from('crm_campaigns').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// AI CONFIG
// ============================================================

export async function fetchAiConfig() {
  const { data, error } = await supabase.from('crm_ai_config').select('*').single()
  if (error && error.code !== 'PGRST116') throw error
  return data as CrmAiConfig | null
}

export async function upsertAiConfig(config: Partial<CrmAiConfig>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('crm_ai_config')
    .upsert({ ...config, user_id: user.id }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data as CrmAiConfig
}

// ============================================================
// WEBHOOK TOKENS
// ============================================================

export async function fetchWebhookTokens() {
  const { data, error } = await supabase
    .from('crm_webhook_tokens')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CrmWebhookToken[]
}

export async function createWebhookToken() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

  const { data, error } = await supabase
    .from('crm_webhook_tokens')
    .insert({ user_id: user.id, token, platform: 'meta_ads' })
    .select()
    .single()
  if (error) throw error
  return data as CrmWebhookToken
}

export async function deleteWebhookToken(id: string) {
  const { error } = await supabase.from('crm_webhook_tokens').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function fetchDashboardStats(): Promise<CrmDashboardStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()

  // Fetch all leads
  const { data: allLeads, error } = await supabase
    .from('crm_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error

  const leads = (allLeads || []) as CrmLead[]

  const totalLeads = leads.length
  const newLeadsToday = leads.filter((l) => l.created_at >= todayStart).length
  const newLeadsWeek = leads.filter((l) => l.created_at >= weekStart).length
  const qualifiedLeads = leads.filter((l) =>
    ['qualificado', 'agendado', 'convertido'].includes(l.pipeline_stage),
  ).length
  const convertedLeads = leads.filter((l) => l.pipeline_stage === 'convertido').length
  const lostLeads = leads.filter((l) => l.pipeline_stage === 'perdido').length
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
  const avgScore =
    leads.length > 0 ? leads.reduce((acc, l) => acc + (l.score || 0), 0) / leads.length : 0

  const hotLeads = leads.filter((l) => l.classification === 'quente').length
  const warmLeads = leads.filter((l) => l.classification === 'morno').length
  const coldLeads = leads.filter((l) => l.classification === 'frio').length
  const pendingWhatsApp = leads.filter((l) => l.whatsapp_status === 'pending').length

  const convertedWithValue = leads.filter(
    (l) => l.pipeline_stage === 'convertido' && l.actual_value > 0,
  )
  const totalRevenue = convertedWithValue.reduce((acc, l) => acc + l.actual_value, 0)
  const avgTicket = convertedWithValue.length > 0 ? totalRevenue / convertedWithValue.length : 0

  // Group by source
  const sourceMap = new Map<string, number>()
  leads.forEach((l) => {
    sourceMap.set(l.source, (sourceMap.get(l.source) || 0) + 1)
  })
  const leadsBySource = Array.from(sourceMap.entries()).map(([source, count]) => ({
    source,
    count,
  }))

  // Group by stage
  const stageMap = new Map<string, number>()
  leads.forEach((l) => {
    stageMap.set(l.pipeline_stage, (stageMap.get(l.pipeline_stage) || 0) + 1)
  })
  const leadsByStage = Array.from(stageMap.entries()).map(([stage, count]) => ({
    stage,
    count,
  }))

  // Trend last 30 days
  const leadsTrend: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = leads.filter((l) => l.created_at.startsWith(dateStr)).length
    leadsTrend.push({ date: dateStr, count })
  }

  // Top campaigns
  const { data: campaigns } = await supabase
    .from('crm_campaigns')
    .select('*')
    .order('total_leads', { ascending: false })
    .limit(5)

  const topCampaigns = (campaigns || []).map((c: any) => ({
    name: c.name,
    leads: c.total_leads,
    qualified: c.total_qualified,
    converted: c.total_converted,
  }))

  return {
    totalLeads,
    newLeadsToday,
    newLeadsWeek,
    qualifiedLeads,
    convertedLeads,
    lostLeads,
    conversionRate,
    avgScore,
    hotLeads,
    warmLeads,
    coldLeads,
    pendingWhatsApp,
    totalRevenue,
    avgTicket,
    leadsBySource,
    leadsByStage,
    leadsTrend,
    topCampaigns,
  }
}

// ============================================================
// WHATSAPP INTEGRATION FOR LEADS
// ============================================================

export async function sendWhatsAppToLead(leadId: string, message: string) {
  const lead = await fetchLeadById(leadId)
  if (!lead.whatsapp) throw new Error('Lead não possui WhatsApp')

  const { data: integration } = await supabase.from('user_integrations').select('*').single()

  if (!integration || !integration.instance_name) {
    throw new Error('Integração WhatsApp não configurada')
  }

  const evoUrl = (integration.evolution_api_url || '').replace(/\/$/, '')
  const evoKey = integration.evolution_api_key

  const response = await fetch(`${evoUrl}/message/sendText/${integration.instance_name}`, {
    method: 'POST',
    headers: {
      apikey: evoKey || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: lead.whatsapp,
      text: message,
    }),
  })

  if (!response.ok) {
    throw new Error('Falha ao enviar mensagem WhatsApp')
  }

  await updateLead(leadId, {
    whatsapp_status: 'sent',
    first_contact_at: lead.first_contact_at || new Date().toISOString(),
    last_contact_at: new Date().toISOString(),
    total_messages: (lead.total_messages || 0) + 1,
  })

  await createActivity({
    lead_id: leadId,
    type: 'whatsapp',
    title: 'Mensagem WhatsApp enviada',
    description: message,
    created_by: 'system',
  })

  return true
}
