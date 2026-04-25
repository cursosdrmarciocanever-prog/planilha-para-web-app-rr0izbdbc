import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Webhook,
  Key,
  Copy,
  Trash2,
  Plus,
  Bot,
  MessageSquare,
  Shield,
  Zap,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  Megaphone,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchWebhookTokens,
  createWebhookToken,
  deleteWebhookToken,
  fetchAiConfig,
  upsertAiConfig,
} from '@/services/crm'
import type { CrmWebhookToken, CrmAiConfig } from '@/types/crm'

const DEFAULT_SYSTEM_PROMPT = `Você é a assistente virtual da Clínica Canever, um centro de excelência em saúde integrativa localizado em Maringá-PR.

Seu objetivo é qualificar leads que demonstraram interesse nos serviços da clínica. Você deve:

1. Cumprimentar o lead de forma amigável e profissional
2. Perguntar qual o principal objetivo de saúde (emagrecimento, performance, hormonal, check-up, etc.)
3. Perguntar sobre urgência (imediata, próximas semanas, apenas explorando)
4. Perguntar faixa de investimento mensal em saúde
5. Identificar se já faz algum tratamento similar
6. Responder dúvidas sobre serviços da clínica

Serviços oferecidos:
- Avaliação Hormonal Completa
- Soroterapia (vitaminas, minerais, aminoácidos)
- Check-up Integrativo
- Programa de Emagrecimento
- Longevidade e Performance
- Nutrição Funcional

IMPORTANTE:
- NÃO atendemos planos de saúde (particular)
- Ticket médio: R$ 5.000 por paciente
- Público-alvo: Classe A e B+
- Faixa etária ideal: 28-55 anos
- Não informe valores exatos, diga que a equipe entrará em contato
- Seja empático, profissional e objetivo
- Pontue o lead de 0-100 baseado no perfil (renda, urgência, interesse)
- Ao final, informe que a secretária entrará em contato para agendar

Responda APENAS com o texto da mensagem, sem prefixos ou explicações.`

const DEFAULT_WELCOME = `Olá! 👋 Sou a assistente virtual da *Clínica Canever*, centro de excelência em saúde integrativa em Maringá.

Vi que você demonstrou interesse em nossos serviços! Posso te ajudar com algumas informações.

Qual seu principal objetivo de saúde? Por exemplo:
• Emagrecimento
• Avaliação hormonal
• Soroterapia
• Check-up completo
• Performance e longevidade`

export function CrmSettings() {
  const [tokens, setTokens] = useState<CrmWebhookToken[]>([])
  const [aiConfig, setAiConfig] = useState<Partial<CrmAiConfig>>({
    agent_name: 'Assistente Clínica Canever',
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    welcome_message: DEFAULT_WELCOME,
    auto_qualify: true,
    min_score_qualified: 60,
    is_active: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [tokensData, configData] = await Promise.all([fetchWebhookTokens(), fetchAiConfig()])
      setTokens(tokensData)
      if (configData) {
        setAiConfig(configData)
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateToken() {
    try {
      const token = await createWebhookToken()
      setTokens((prev) => [token, ...prev])
      toast.success('Token de webhook criado')
    } catch (err) {
      toast.error('Erro ao criar token')
    }
  }

  async function handleDeleteToken(id: string) {
    try {
      await deleteWebhookToken(id)
      setTokens((prev) => prev.filter((t) => t.id !== id))
      toast.success('Token removido')
    } catch (err) {
      toast.error('Erro ao remover token')
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência')
  }

  async function handleSaveAiConfig() {
    try {
      setSaving(true)
      await upsertAiConfig(aiConfig)
      toast.success('Configurações de IA salvas')
    } catch (err) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const webhookUrl =
    tokens.length > 0
      ? `${window.location.origin}/api/webhook/meta-leads/${tokens[0]?.token}`
      : 'Crie um token primeiro'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            Webhook Meta Ads
          </CardTitle>
          <CardDescription>
            Configure o webhook para receber leads automaticamente dos formulários do Meta Ads
            (Facebook/Instagram).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como configurar no Meta Ads:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Acesse o Meta Business Suite &gt; Configurações</li>
                  <li>Vá em Integrações &gt; Leads &gt; CRM</li>
                  <li>Selecione "Conectar CRM" e escolha "Outro CRM"</li>
                  <li>Cole a URL do webhook abaixo</li>
                  <li>Use o Verify Token para validação</li>
                  <li>Selecione os formulários que deseja conectar</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Webhook URL */}
          <div>
            <Label className="text-xs text-muted-foreground">URL do Webhook</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={webhookUrl} readOnly className="font-mono text-xs bg-muted" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
                disabled={tokens.length === 0}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Supabase Edge Function URL */}
          <div>
            <Label className="text-xs text-muted-foreground">URL da Edge Function (Supabase)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={
                  tokens.length > 0
                    ? `[SUPABASE_URL]/functions/v1/meta-ads-webhook?token=${tokens[0]?.token}`
                    : 'Crie um token primeiro'
                }
                readOnly
                className="font-mono text-xs bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(
                    `[SUPABASE_URL]/functions/v1/meta-ads-webhook?token=${tokens[0]?.token}`,
                  )
                }
                disabled={tokens.length === 0}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Tokens */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              Tokens de Acesso
            </h4>
            <Button variant="outline" size="sm" onClick={handleCreateToken}>
              <Plus className="w-4 h-4 mr-1" />
              Novo Token
            </Button>
          </div>

          {tokens.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum token criado. Crie um token para ativar o webhook.
            </p>
          )}

          {tokens.map((token) => (
            <div
              key={token.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono truncate">{token.token}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyToClipboard(token.token)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {token.is_active ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                    {token.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span>{token.total_leads_received} leads recebidos</span>
                  <span>Criado em {new Date(token.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDeleteToken(token.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Agente IA - Qualificação de Leads
          </CardTitle>
          <CardDescription>
            Configure o agente de IA que qualifica leads automaticamente via WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Agente Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Ativar qualificação automática de novos leads
              </p>
            </div>
            <Switch
              checked={aiConfig.is_active}
              onCheckedChange={(checked) => setAiConfig({ ...aiConfig, is_active: checked })}
            />
          </div>

          <Separator />

          <div>
            <Label>Nome do Agente</Label>
            <Input
              value={aiConfig.agent_name || ''}
              onChange={(e) => setAiConfig({ ...aiConfig, agent_name: e.target.value })}
              placeholder="Assistente Clínica Canever"
            />
          </div>

          <div>
            <Label>Mensagem de Boas-Vindas</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Primeira mensagem enviada ao lead via WhatsApp
            </p>
            <Textarea
              value={aiConfig.welcome_message || ''}
              onChange={(e) => setAiConfig({ ...aiConfig, welcome_message: e.target.value })}
              rows={6}
              placeholder="Olá! Sou a assistente virtual..."
            />
          </div>

          <div>
            <Label>System Prompt (Instruções da IA)</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Instruções detalhadas para o comportamento do agente de IA
            </p>
            <Textarea
              value={aiConfig.system_prompt || ''}
              onChange={(e) => setAiConfig({ ...aiConfig, system_prompt: e.target.value })}
              rows={12}
              className="font-mono text-xs"
              placeholder="Você é a assistente virtual da Clínica Canever..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Qualificação Automática</Label>
              <p className="text-xs text-muted-foreground">
                IA qualifica e pontua leads automaticamente
              </p>
            </div>
            <Switch
              checked={aiConfig.auto_qualify}
              onCheckedChange={(checked) => setAiConfig({ ...aiConfig, auto_qualify: checked })}
            />
          </div>

          <div>
            <Label>Score Mínimo para Qualificado</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Leads com score acima deste valor serão marcados como "qualificados"
            </p>
            <Input
              type="number"
              min={0}
              max={100}
              value={aiConfig.min_score_qualified || 60}
              onChange={(e) =>
                setAiConfig({
                  ...aiConfig,
                  min_score_qualified: parseInt(e.target.value) || 60,
                })
              }
              className="w-32"
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSaveAiConfig} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Status das Integrações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Meta Ads Webhook</p>
                  <p className="text-xs text-muted-foreground">
                    Recebe leads dos formulários do Facebook/Instagram
                  </p>
                </div>
              </div>
              <Badge
                className={
                  tokens.length > 0
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }
              >
                {tokens.length > 0 ? 'Configurado' : 'Pendente'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">WhatsApp (Evolution API)</p>
                  <p className="text-xs text-muted-foreground">
                    Envia mensagens e qualifica leads via WhatsApp
                  </p>
                </div>
              </div>
              <Badge className="bg-green-50 text-green-600 border-green-200">Integrado</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Agente IA (Gemini)</p>
                  <p className="text-xs text-muted-foreground">
                    Qualificação inteligente de leads com IA generativa
                  </p>
                </div>
              </div>
              <Badge
                className={
                  aiConfig.is_active
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                }
              >
                {aiConfig.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
