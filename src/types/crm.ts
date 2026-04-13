// CRM Types for Leads, Campaigns, and Pipeline Management

export type PipelineStage =
  | 'novo'
  | 'contatado'
  | 'qualificando'
  | 'qualificado'
  | 'agendado'
  | 'convertido'
  | 'perdido'

export type LeadClassification = 'quente' | 'morno' | 'frio'

export type LeadSource =
  | 'meta_ads'
  | 'whatsapp'
  | 'manual'
  | 'website'
  | 'indicacao'

export type LeadPriority = 'alta' | 'normal' | 'baixa'

export type WhatsAppStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'replied'
  | 'failed'

export type CampaignStatus = 'active' | 'paused' | 'archived'

export type ActivityType =
  | 'note'
  | 'call'
  | 'whatsapp'
  | 'email'
  | 'stage_change'
  | 'ai_qualification'
  | 'appointment'
  | 'meta_webhook'

export interface CrmCampaign {
  id: string
  user_id: string
  name: string
  platform: string
  campaign_id: string | null
  ad_set_id: string | null
  ad_id: string | null
  form_id: string | null
  status: CampaignStatus
  budget: number
  start_date: string | null
  end_date: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  total_leads: number
  total_qualified: number
  total_converted: number
  cost_per_lead: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CrmLead {
  id: string
  user_id: string
  campaign_id: string | null

  // Dados pessoais
  name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  cpf: string | null
  age: number | null
  gender: string | null
  city: string | null
  state: string | null

  // Qualificação
  source: LeadSource
  pipeline_stage: PipelineStage
  score: number
  classification: LeadClassification
  priority: LeadPriority

  // Interesse
  interest: string | null
  monthly_income_range: string | null
  urgency: string | null
  has_health_plan: boolean
  current_treatments: string | null
  health_goals: string | null
  objections: string | null

  // Meta Ads
  meta_lead_id: string | null
  meta_form_data: Record<string, any> | null
  ad_name: string | null

  // IA
  ai_qualified: boolean
  ai_score: number | null
  ai_summary: string | null
  ai_conversation_id: string | null
  ai_qualified_at: string | null

  // WhatsApp
  whatsapp_contact_id: string | null
  whatsapp_status: WhatsAppStatus
  first_contact_at: string | null
  last_contact_at: string | null
  total_messages: number

  // Conversão
  assigned_to: string | null
  converted_at: string | null
  lost_reason: string | null
  appointment_date: string | null
  estimated_value: number
  actual_value: number

  // Metadados
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string

  // Joins
  campaign?: CrmCampaign | null
}

export interface CrmLeadActivity {
  id: string
  user_id: string
  lead_id: string
  type: ActivityType
  title: string
  description: string | null
  metadata: Record<string, any> | null
  created_by: string | null
  created_at: string
}

export interface CrmAiConfig {
  id: string
  user_id: string
  agent_name: string
  system_prompt: string
  welcome_message: string
  qualification_questions: QualificationQuestion[]
  scoring_rules: Record<string, any>
  auto_qualify: boolean
  min_score_qualified: number
  auto_assign_agent: boolean
  ai_agent_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QualificationQuestion {
  id: string
  question: string
  field: string
  type: 'text' | 'select' | 'number'
  options?: string[]
  weight: number
}

export interface CrmWebhookToken {
  id: string
  user_id: string
  token: string
  platform: string
  is_active: boolean
  last_used_at: string | null
  total_leads_received: number
  created_at: string
}

// Pipeline stage configuration
export const PIPELINE_STAGES: {
  key: PipelineStage
  label: string
  color: string
  bgColor: string
  icon: string
}[] = [
  { key: 'novo', label: 'Novo', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: 'sparkles' },
  { key: 'contatado', label: 'Contatado', color: 'text-cyan-600', bgColor: 'bg-cyan-50 border-cyan-200', icon: 'phone' },
  { key: 'qualificando', label: 'Qualificando', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', icon: 'bot' },
  { key: 'qualificado', label: 'Qualificado', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', icon: 'check-circle' },
  { key: 'agendado', label: 'Agendado', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200', icon: 'calendar' },
  { key: 'convertido', label: 'Convertido', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: 'trophy' },
  { key: 'perdido', label: 'Perdido', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', icon: 'x-circle' },
]

export const LEAD_SOURCES: { key: LeadSource; label: string }[] = [
  { key: 'meta_ads', label: 'Meta Ads' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'manual', label: 'Manual' },
  { key: 'website', label: 'Website' },
  { key: 'indicacao', label: 'Indicação' },
]

export const CLASSIFICATION_OPTIONS: { key: LeadClassification; label: string; color: string }[] = [
  { key: 'quente', label: 'Quente', color: 'text-red-600 bg-red-50' },
  { key: 'morno', label: 'Morno', color: 'text-yellow-600 bg-yellow-50' },
  { key: 'frio', label: 'Frio', color: 'text-blue-600 bg-blue-50' },
]

export const INTEREST_OPTIONS = [
  'Emagrecimento',
  'Soroterapia',
  'Avaliação Hormonal',
  'Check-up Completo',
  'Performance',
  'Saúde Integrativa',
  'Nutrição',
  'Longevidade',
  'Outro',
]

export const INCOME_RANGES = [
  'Até R$ 5.000',
  'R$ 5.000 - R$ 10.000',
  'R$ 10.000 - R$ 20.000',
  'R$ 20.000 - R$ 50.000',
  'Acima de R$ 50.000',
]

export const URGENCY_OPTIONS = [
  { key: 'imediata', label: 'Imediata' },
  { key: '1_semana', label: 'Próxima semana' },
  { key: '1_mes', label: 'Próximo mês' },
  { key: 'explorando', label: 'Apenas explorando' },
]

// Dashboard stats interface
export interface CrmDashboardStats {
  totalLeads: number
  newLeadsToday: number
  newLeadsWeek: number
  qualifiedLeads: number
  convertedLeads: number
  lostLeads: number
  conversionRate: number
  avgScore: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  pendingWhatsApp: number
  totalRevenue: number
  avgTicket: number
  leadsBySource: { source: string; count: number }[]
  leadsByStage: { stage: string; count: number }[]
  leadsTrend: { date: string; count: number }[]
  topCampaigns: { name: string; leads: number; qualified: number; converted: number }[]
}
