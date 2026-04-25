import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * CRM AI Lead Qualifier
 * 
 * This function is called after a WhatsApp conversation with a lead.
 * It analyzes the conversation history and qualifies the lead based on:
 * - Interest level and alignment with Clínica Canever services
 * - Income range / ability to invest
 * - Urgency
 * - Health goals
 * - Overall fit for premium health services
 * 
 * Uses OpenAI API (gpt-4.1-mini) for qualification.
 */

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lead_id, contact_id, user_id } = await req.json()

    if (!lead_id && !contact_id) {
      return new Response(
        JSON.stringify({ error: 'lead_id or contact_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find the CRM lead
    let lead: any = null
    if (lead_id) {
      const { data } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('id', lead_id)
        .single()
      lead = data
    } else if (contact_id) {
      const { data } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('whatsapp_contact_id', contact_id)
        .single()
      lead = data
    }

    if (!lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const effectiveUserId = user_id || lead.user_id

    // Get AI config
    const { data: aiConfig } = await supabase
      .from('crm_ai_config')
      .select('*')
      .eq('user_id', effectiveUserId)
      .single()

    if (!aiConfig) {
      return new Response(
        JSON.stringify({ error: 'AI config not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Get conversation history
    let conversationHistory = ''
    if (lead.whatsapp_contact_id) {
      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('text, from_me, timestamp')
        .eq('contact_id', lead.whatsapp_contact_id)
        .order('timestamp', { ascending: true })
        .limit(30)

      if (messages && messages.length > 0) {
        conversationHistory = messages
          .map((m: any) => `${m.from_me ? 'Helena (Assistente)' : 'Lead'}: ${m.text}`)
          .join('\n')
      }
    }

    // Get OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const openaiBaseUrl = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1'

    // Build qualification prompt
    const qualificationPrompt = `Você é um especialista em qualificação de leads para a Clínica Canever, um centro de excelência em saúde integrativa em Maringá-PR.

INFORMAÇÕES DO LEAD:
- Nome: ${lead.name}
- Telefone: ${lead.whatsapp || lead.phone || 'N/A'}
- Email: ${lead.email || 'N/A'}
- Cidade: ${lead.city || 'N/A'}
- Origem: ${lead.source}
${lead.interest ? `- Interesse declarado: ${lead.interest}` : ''}
${lead.monthly_income_range ? `- Faixa de renda: ${lead.monthly_income_range}` : ''}
${lead.health_goals ? `- Objetivos de saúde: ${lead.health_goals}` : ''}

${conversationHistory ? `HISTÓRICO DA CONVERSA WHATSAPP:\n${conversationHistory}\n` : 'SEM HISTÓRICO DE CONVERSA DISPONÍVEL.'}

CRITÉRIOS DE QUALIFICAÇÃO:
- Público-alvo: Classe A e B+ (renda familiar acima de R$ 10.000/mês)
- Ticket médio: R$ 5.000 por paciente
- Faixa etária ideal: 28-55 anos
- Não atendemos planos de saúde (apenas particular)
- Serviços: Avaliação Hormonal, Soroterapia, Emagrecimento, Check-up, Performance, Longevidade

ANALISE o lead e responda EXATAMENTE neste formato JSON:
{
  "score": <número de 0 a 100>,
  "classification": "<quente|morno|frio>",
  "interest": "<interesse principal identificado>",
  "urgency": "<imediata|1_semana|1_mes|explorando>",
  "monthly_income_range": "<faixa de renda estimada ou declarada>",
  "health_goals": "<objetivos de saúde identificados>",
  "objections": "<objeções ou preocupações identificadas>",
  "summary": "<resumo de 2-3 frases sobre o perfil do lead e recomendação>",
  "recommended_action": "<próxima ação recomendada>",
  "pipeline_stage": "<qualificado|qualificando|perdido>"
}

REGRAS DE PONTUAÇÃO:
- Score 80-100: Lead quente (perfil ideal, renda alta, urgência imediata, interesse claro)
- Score 50-79: Lead morno (potencial, mas precisa de mais informações ou tem objeções)
- Score 0-49: Lead frio (fora do perfil, sem urgência, ou sem condições financeiras)

Responda APENAS com o JSON, sem texto adicional.`

    // Call OpenAI API
    const apiUrl = `${openaiBaseUrl}/chat/completions`
    
    const aiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em qualificação de leads. Responda APENAS com JSON válido, sem markdown ou texto adicional.',
          },
          {
            role: 'user',
            content: qualificationPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      console.error('[CRM AI Qualify] OpenAI API error:', errText)
      return new Response(
        JSON.stringify({ error: 'AI API error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const aiData = await aiRes.json()
    const responseText = aiData.choices?.[0]?.message?.content?.trim()

    if (!responseText) {
      console.error('[CRM AI Qualify] Empty AI response')
      return new Response(
        JSON.stringify({ error: 'Empty AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Parse JSON response
    let qualification: any
    try {
      // Remove markdown code blocks if present
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      qualification = JSON.parse(cleanJson)
    } catch (parseErr) {
      console.error('[CRM AI Qualify] Failed to parse AI response:', responseText)
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', raw: responseText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Update CRM lead with AI qualification
    const updates: any = {
      ai_qualified: true,
      ai_score: qualification.score || 0,
      ai_summary: qualification.summary || '',
      ai_qualified_at: new Date().toISOString(),
      score: qualification.score || lead.score,
      classification: qualification.classification || lead.classification,
    }

    // Only update fields if AI provided them and they weren't already set
    if (qualification.interest && !lead.interest) {
      updates.interest = qualification.interest
    }
    if (qualification.urgency && !lead.urgency) {
      updates.urgency = qualification.urgency
    }
    if (qualification.monthly_income_range && !lead.monthly_income_range) {
      updates.monthly_income_range = qualification.monthly_income_range
    }
    if (qualification.health_goals && !lead.health_goals) {
      updates.health_goals = qualification.health_goals
    }
    if (qualification.objections) {
      updates.objections = qualification.objections
    }

    // Update pipeline stage based on AI recommendation
    if (qualification.pipeline_stage === 'qualificado' && qualification.score >= (aiConfig.min_score_qualified || 60)) {
      updates.pipeline_stage = 'qualificado'
    } else if (qualification.pipeline_stage === 'perdido') {
      updates.pipeline_stage = 'perdido'
      updates.lost_reason = qualification.objections || 'Não qualificado pela IA'
    } else {
      updates.pipeline_stage = 'qualificando'
    }

    const { error: updateError } = await supabase
      .from('crm_leads')
      .update(updates)
      .eq('id', lead.id)

    if (updateError) {
      console.error('[CRM AI Qualify] Error updating lead:', updateError)
    }

    // Create activity log
    await supabase.from('crm_lead_activities').insert({
      user_id: effectiveUserId,
      lead_id: lead.id,
      type: 'ai_qualification',
      title: `IA qualificou lead como "${qualification.classification}" (Score: ${qualification.score}/100)`,
      description: qualification.summary + (qualification.recommended_action ? `\n\nAção recomendada: ${qualification.recommended_action}` : ''),
      metadata: qualification,
      created_by: 'ai',
    })

    console.log(`[CRM AI Qualify] Lead ${lead.id} qualified: score=${qualification.score}, class=${qualification.classification}`)

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        qualification,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('[CRM AI Qualify] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
