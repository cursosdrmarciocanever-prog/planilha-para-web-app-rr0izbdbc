-- ============================================================
-- CRM Module: Leads, Campanhas Meta Ads, Pipeline de Qualificação
-- ============================================================

-- Tabela de Campanhas Meta Ads
CREATE TABLE IF NOT EXISTS public.crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'meta_ads', -- meta_ads, google_ads, manual
  campaign_id TEXT, -- ID da campanha no Meta Ads
  ad_set_id TEXT,
  ad_id TEXT,
  form_id TEXT, -- ID do formulário de leads no Meta
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, archived
  budget NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  total_leads INTEGER DEFAULT 0,
  total_qualified INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela principal de Leads CRM
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.crm_campaigns(id) ON DELETE SET NULL,
  
  -- Dados pessoais
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  cpf TEXT,
  age INTEGER,
  gender TEXT, -- masculino, feminino, outro
  city TEXT,
  state TEXT,
  
  -- Dados de qualificação
  source TEXT NOT NULL DEFAULT 'meta_ads', -- meta_ads, whatsapp, manual, website, indicacao
  pipeline_stage TEXT NOT NULL DEFAULT 'novo', -- novo, contatado, qualificando, qualificado, agendado, convertido, perdido
  score INTEGER DEFAULT 0, -- 0-100 score de qualificação
  classification TEXT DEFAULT 'frio', -- quente, morno, frio
  priority TEXT DEFAULT 'normal', -- alta, normal, baixa
  
  -- Dados de interesse
  interest TEXT, -- emagrecimento, soroterapia, hormonal, check-up, performance
  monthly_income_range TEXT, -- até 5k, 5k-10k, 10k-20k, 20k-50k, 50k+
  urgency TEXT, -- imediata, 1_semana, 1_mes, explorando
  has_health_plan BOOLEAN DEFAULT false,
  current_treatments TEXT,
  health_goals TEXT,
  objections TEXT,
  
  -- Dados Meta Ads
  meta_lead_id TEXT, -- ID do lead no Meta
  meta_form_data JSONB, -- Dados brutos do formulário Meta
  ad_name TEXT,
  
  -- Qualificação IA
  ai_qualified BOOLEAN DEFAULT false,
  ai_score INTEGER,
  ai_summary TEXT,
  ai_conversation_id TEXT,
  ai_qualified_at TIMESTAMPTZ,
  
  -- WhatsApp
  whatsapp_contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE SET NULL,
  whatsapp_status TEXT DEFAULT 'pending', -- pending, sent, delivered, replied, failed
  first_contact_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  total_messages INTEGER DEFAULT 0,
  
  -- Conversão
  assigned_to TEXT, -- nome do vendedor/secretária
  converted_at TIMESTAMPTZ,
  lost_reason TEXT,
  appointment_date TIMESTAMPTZ,
  estimated_value NUMERIC DEFAULT 0,
  actual_value NUMERIC DEFAULT 0,
  
  -- Metadados
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de atividades/histórico do lead
CREATE TABLE IF NOT EXISTS public.crm_lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- note, call, whatsapp, email, stage_change, ai_qualification, appointment, meta_webhook
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_by TEXT, -- 'system', 'ai', user email
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configuração do agente IA para qualificação de leads
CREATE TABLE IF NOT EXISTS public.crm_ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL DEFAULT 'Assistente Clínica Canever',
  system_prompt TEXT NOT NULL DEFAULT '',
  welcome_message TEXT NOT NULL DEFAULT 'Olá! Sou a assistente virtual da Clínica Canever. Vi que você demonstrou interesse em nossos serviços. Posso te ajudar com algumas informações?',
  qualification_questions JSONB DEFAULT '[]'::jsonb,
  scoring_rules JSONB DEFAULT '{}'::jsonb,
  auto_qualify BOOLEAN DEFAULT true,
  min_score_qualified INTEGER DEFAULT 60,
  auto_assign_agent BOOLEAN DEFAULT true,
  ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de webhook tokens para Meta Ads
CREATE TABLE IF NOT EXISTS public.crm_webhook_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'meta_ads',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  total_leads_received INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crm_leads_user_id ON public.crm_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_pipeline_stage ON public.crm_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_classification ON public.crm_leads(classification);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON public.crm_leads(source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_campaign_id ON public.crm_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON public.crm_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_score ON public.crm_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_lead_activities_lead_id ON public.crm_lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_user_id ON public.crm_campaigns(user_id);

-- RLS
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_webhook_tokens ENABLE ROW LEVEL SECURITY;

-- Policies - Campanhas
CREATE POLICY "Users can view own campaigns" ON public.crm_campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON public.crm_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.crm_campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.crm_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Policies - Leads
CREATE POLICY "Users can view own leads" ON public.crm_leads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.crm_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.crm_leads
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.crm_leads
  FOR DELETE USING (auth.uid() = user_id);

-- Policies - Atividades
CREATE POLICY "Users can view own lead activities" ON public.crm_lead_activities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lead activities" ON public.crm_lead_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies - AI Config
CREATE POLICY "Users can view own ai config" ON public.crm_ai_config
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai config" ON public.crm_ai_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai config" ON public.crm_ai_config
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies - Webhook Tokens
CREATE POLICY "Users can view own webhook tokens" ON public.crm_webhook_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own webhook tokens" ON public.crm_webhook_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own webhook tokens" ON public.crm_webhook_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role policy para webhooks (Meta Ads envia sem autenticação)
CREATE POLICY "Service role can insert leads" ON public.crm_leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert activities" ON public.crm_lead_activities
  FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_crm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_crm_updated_at();

CREATE TRIGGER trigger_crm_campaigns_updated_at
  BEFORE UPDATE ON public.crm_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_crm_updated_at();

-- Função para atualizar contadores da campanha
CREATE OR REPLACE FUNCTION public.update_campaign_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.crm_campaigns 
    SET total_leads = total_leads + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.pipeline_stage = 'qualificado' AND OLD.pipeline_stage != 'qualificado' THEN
    UPDATE public.crm_campaigns 
    SET total_qualified = total_qualified + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.pipeline_stage = 'convertido' AND OLD.pipeline_stage != 'convertido' THEN
    UPDATE public.crm_campaigns 
    SET total_converted = total_converted + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_counters
  AFTER INSERT OR UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_counters();
