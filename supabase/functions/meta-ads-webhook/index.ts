import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Handle Meta Ads webhook verification (GET request)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const verifyToken = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    // Verify against stored token or env variable
    const storedVerifyToken = Deno.env.get('META_WEBHOOK_VERIFY_TOKEN')

    if (mode === 'subscribe' && verifyToken && verifyToken === storedVerifyToken) {
      console.log('[Meta Webhook] Verification successful')
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    // Also try token from URL param for backwards compatibility
    const token = url.searchParams.get('token')
    if (mode === 'subscribe' && token && verifyToken === token) {
      console.log('[Meta Webhook] Verification successful (legacy token)')
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    return new Response('Verification failed', {
      status: 403,
      headers: { ...corsHeaders },
    })
  }

  // Handle POST - New lead from Meta Ads
  // Meta sends POST without token in URL, so we find the webhook token by other means
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      console.log('[Meta Webhook] Received payload:', JSON.stringify(body))

      // Find webhook token - try URL param first, then get the first active one
      let webhookToken: any = null
      const token = url.searchParams.get('token')

      if (token) {
        const { data } = await supabase
          .from('crm_webhook_tokens')
          .select('*')
          .eq('token', token)
          .eq('is_active', true)
          .single()
        webhookToken = data
      }

      if (!webhookToken) {
        // Get the first active webhook token (Meta doesn't send token in POST)
        const { data } = await supabase
          .from('crm_webhook_tokens')
          .select('*')
          .eq('platform', 'meta_ads')
          .eq('is_active', true)
          .limit(1)
          .single()
        webhookToken = data
      }

      if (!webhookToken) {
        console.error('[Meta Webhook] No active webhook token found')
        return new Response(JSON.stringify({ error: 'No active webhook token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Meta sends data in this format:
      // { entry: [{ changes: [{ value: { leadgen_id, page_id, form_id, ... } }] }] }
      const entries = body.entry || []
      let leadsProcessed = 0

      for (const entry of entries) {
        const changes = entry.changes || []
        for (const change of changes) {
          if (change.field === 'leadgen') {
            const leadData = change.value
            const leadgenId = leadData.leadgen_id
            const formId = leadData.form_id
            const pageId = leadData.page_id
            const createdTime = leadData.created_time

            // Try to fetch lead details from Meta Graph API if access token is available
            let leadDetails: any = null
            const metaAccessToken = Deno.env.get('META_ACCESS_TOKEN')

            if (metaAccessToken && leadgenId) {
              try {
                const metaRes = await fetch(
                  `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${metaAccessToken}`,
                )
                if (metaRes.ok) {
                  leadDetails = await metaRes.json()
                  console.log(
                    '[Meta Webhook] Lead details from Graph API:',
                    JSON.stringify(leadDetails),
                  )
                }
              } catch (err) {
                console.error('[Meta Webhook] Error fetching lead details:', err)
              }
            }

            // Parse lead fields from Meta form data
            const fieldData = leadDetails?.field_data || []
            const getName = () => {
              const fullName = fieldData.find((f: any) => f.name === 'full_name')?.values?.[0]
              if (fullName) return fullName
              const firstName =
                fieldData.find((f: any) => f.name === 'first_name')?.values?.[0] || ''
              const lastName = fieldData.find((f: any) => f.name === 'last_name')?.values?.[0] || ''
              return `${firstName} ${lastName}`.trim() || 'Lead Meta Ads'
            }

            const name = getName()
            const email = fieldData.find((f: any) => f.name === 'email')?.values?.[0] || null
            const phone = fieldData.find((f: any) => f.name === 'phone_number')?.values?.[0] || null
            const city = fieldData.find((f: any) => f.name === 'city')?.values?.[0] || null
            const state = fieldData.find((f: any) => f.name === 'state')?.values?.[0] || null

            // Find matching campaign by form_id
            let campaignId = null
            if (formId) {
              const { data: campaign } = await supabase
                .from('crm_campaigns')
                .select('id')
                .eq('user_id', webhookToken.user_id)
                .eq('form_id', formId)
                .single()
              if (campaign) {
                campaignId = campaign.id
              }
            }

            // Check for duplicate lead (same meta_lead_id)
            if (leadgenId) {
              const { data: existing } = await supabase
                .from('crm_leads')
                .select('id')
                .eq('meta_lead_id', leadgenId)
                .single()
              if (existing) {
                console.log('[Meta Webhook] Duplicate lead, skipping:', leadgenId)
                continue
              }
            }

            // Create lead
            const { data: newLead, error: leadError } = await supabase
              .from('crm_leads')
              .insert({
                user_id: webhookToken.user_id,
                campaign_id: campaignId,
                name,
                email,
                phone,
                whatsapp: phone, // Use phone as whatsapp initially
                city,
                state,
                source: 'meta_ads',
                pipeline_stage: 'novo',
                classification: 'morno',
                score: 30,
                meta_lead_id: leadgenId,
                meta_form_data: leadDetails || body,
                ad_name: leadData.ad_name || null,
              })
              .select()
              .single()

            if (leadError) {
              console.error('[Meta Webhook] Error creating lead:', leadError)
              continue
            }

            console.log('[Meta Webhook] Lead created:', newLead.id)

            // Create activity log
            await supabase.from('crm_lead_activities').insert({
              user_id: webhookToken.user_id,
              lead_id: newLead.id,
              type: 'meta_webhook',
              title: 'Lead recebido do Meta Ads',
              description: `Lead "${name}" recebido via formulário Meta Ads${formId ? ` (Form: ${formId})` : ''}`,
              metadata: { leadgen_id: leadgenId, form_id: formId, page_id: pageId },
              created_by: 'system',
            })

            // Trigger WhatsApp AI qualification if phone is available
            if (phone) {
              try {
                // Check if AI config is active
                const { data: aiConfig } = await supabase
                  .from('crm_ai_config')
                  .select('*')
                  .eq('user_id', webhookToken.user_id)
                  .eq('is_active', true)
                  .single()

                if (aiConfig) {
                  // Get user integration for WhatsApp
                  const { data: integration } = await supabase
                    .from('user_integrations')
                    .select('*')
                    .eq('user_id', webhookToken.user_id)
                    .single()

                  if (integration && integration.instance_name) {
                    const evoUrl = (
                      integration.evolution_api_url ||
                      Deno.env.get('EVOLUTION_API_URL') ||
                      ''
                    ).replace(/\/$/, '')
                    const evoKey =
                      integration.evolution_api_key || Deno.env.get('EVOLUTION_API_KEY')

                    // Send welcome message
                    const welcomeMsg =
                      aiConfig.welcome_message ||
                      `Olá ${name.split(' ')[0]}! Sou a Helena, assistente da Clínica Canever. Para darmos continuidade no seu atendimento, qual seu nome por favor?`

                    const sendRes = await fetch(
                      `${evoUrl}/message/sendText/${integration.instance_name}`,
                      {
                        method: 'POST',
                        headers: {
                          apikey: evoKey || '',
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          number: phone,
                          text: welcomeMsg,
                        }),
                      },
                    )

                    if (sendRes.ok) {
                      console.log('[Meta Webhook] Welcome message sent to:', phone)

                      // Update lead status
                      await supabase
                        .from('crm_leads')
                        .update({
                          whatsapp_status: 'sent',
                          pipeline_stage: 'contatado',
                          first_contact_at: new Date().toISOString(),
                          last_contact_at: new Date().toISOString(),
                          total_messages: 1,
                        })
                        .eq('id', newLead.id)

                      // Log activity
                      await supabase.from('crm_lead_activities').insert({
                        user_id: webhookToken.user_id,
                        lead_id: newLead.id,
                        type: 'whatsapp',
                        title: 'Mensagem de boas-vindas enviada via WhatsApp (Helena)',
                        description: welcomeMsg,
                        created_by: 'ai',
                      })

                      // Create/update whatsapp_contact for AI agent to handle responses
                      const remoteJid = phone.replace(/\D/g, '') + '@s.whatsapp.net'

                      // Find the AI agent for CRM qualification
                      let aiAgentId = aiConfig.ai_agent_id
                      if (!aiAgentId) {
                        // Try to find the Helena agent
                        const { data: helenaAgent } = await supabase
                          .from('ai_agents')
                          .select('id')
                          .eq('user_id', webhookToken.user_id)
                          .eq('is_active', true)
                          .limit(1)
                          .single()
                        if (helenaAgent) {
                          aiAgentId = helenaAgent.id
                        }
                      }

                      const { data: existingContact } = await supabase
                        .from('whatsapp_contacts')
                        .select('id')
                        .eq('remote_jid', remoteJid)
                        .eq('user_id', webhookToken.user_id)
                        .single()

                      if (!existingContact) {
                        const { data: newContact } = await supabase
                          .from('whatsapp_contacts')
                          .insert({
                            user_id: webhookToken.user_id,
                            remote_jid: remoteJid,
                            push_name: name,
                            phone_number: phone,
                            pipeline_stage: 'Em Conversa',
                            ai_agent_id: aiAgentId,
                            classification: 'Lead Meta Ads',
                            last_message_at: new Date().toISOString(),
                          })
                          .select()
                          .single()

                        if (newContact) {
                          // Link whatsapp contact to CRM lead
                          await supabase
                            .from('crm_leads')
                            .update({ whatsapp_contact_id: newContact.id })
                            .eq('id', newLead.id)
                        }
                      } else {
                        // Link existing contact and assign AI agent
                        await supabase
                          .from('crm_leads')
                          .update({ whatsapp_contact_id: existingContact.id })
                          .eq('id', newLead.id)

                        // Update contact with AI agent
                        if (aiAgentId) {
                          await supabase
                            .from('whatsapp_contacts')
                            .update({
                              ai_agent_id: aiAgentId,
                              pipeline_stage: 'Em Conversa',
                              classification: 'Lead Meta Ads',
                            })
                            .eq('id', existingContact.id)
                        }
                      }
                    } else {
                      console.error('[Meta Webhook] Failed to send WhatsApp:', await sendRes.text())
                    }
                  }
                }
              } catch (err) {
                console.error('[Meta Webhook] Error in WhatsApp integration:', err)
              }
            }

            leadsProcessed++
          }
        }
      }

      // Update webhook token counter
      await supabase
        .from('crm_webhook_tokens')
        .update({
          last_used_at: new Date().toISOString(),
          total_leads_received: webhookToken.total_leads_received + leadsProcessed,
        })
        .eq('id', webhookToken.id)

      return new Response(
        JSON.stringify({
          success: true,
          leads_processed: leadsProcessed,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } catch (err) {
      console.error('[Meta Webhook] Error processing webhook:', err)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: corsHeaders,
  })
})
