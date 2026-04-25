import { createClient } from 'jsr:@supabase/supabase-js@2'

/**
 * CRM Handler - Integrates WhatsApp conversations with CRM lead qualification
 * 
 * This handler is called after the AI responds to a WhatsApp message.
 * It checks if the contact is linked to a CRM lead and triggers
 * AI qualification after enough conversation has happened.
 */

const MESSAGES_BEFORE_QUALIFICATION = 4 // Qualify after 4 messages from the lead

export async function processCrmQualification(
  userId: string,
  contactId: string,
  supabaseUrl: string,
  supabaseKey: string,
) {
  console.log(`[CRM Handler] Checking CRM qualification for contact: ${contactId}`)

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if this contact is linked to a CRM lead
    const { data: lead } = await supabase
      .from('crm_leads')
      .select('id, ai_qualified, pipeline_stage, total_messages, whatsapp_contact_id')
      .eq('user_id', userId)
      .eq('whatsapp_contact_id', contactId)
      .single()

    if (!lead) {
      // Check if there's a lead with matching phone number
      const { data: contact } = await supabase
        .from('whatsapp_contacts')
        .select('phone_number, remote_jid')
        .eq('id', contactId)
        .single()

      if (contact && contact.phone_number) {
        const { data: leadByPhone } = await supabase
          .from('crm_leads')
          .select('id, ai_qualified, pipeline_stage, total_messages, whatsapp_contact_id')
          .eq('user_id', userId)
          .or(`whatsapp.eq.${contact.phone_number},phone.eq.${contact.phone_number}`)
          .is('whatsapp_contact_id', null)
          .limit(1)
          .maybeSingle()

        if (leadByPhone) {
          // Link the contact to the lead
          await supabase
            .from('crm_leads')
            .update({ whatsapp_contact_id: contactId })
            .eq('id', leadByPhone.id)

          console.log(`[CRM Handler] Linked contact ${contactId} to lead ${leadByPhone.id}`)
          // Continue with this lead
          return await qualifyLead(supabase, userId, leadByPhone, contactId, supabaseUrl, supabaseKey)
        }
      }

      console.log(`[CRM Handler] No CRM lead found for contact ${contactId}`)
      return
    }

    return await qualifyLead(supabase, userId, lead, contactId, supabaseUrl, supabaseKey)
  } catch (error) {
    console.error('[CRM Handler] Error:', error)
  }
}

async function qualifyLead(
  supabase: any,
  userId: string,
  lead: any,
  contactId: string,
  supabaseUrl: string,
  supabaseKey: string,
) {
  // Count messages from the lead (not from us)
  const { count: messageCount } = await supabase
    .from('whatsapp_messages')
    .select('id', { count: 'exact', head: true })
    .eq('contact_id', contactId)
    .eq('from_me', false)

  const totalMsgs = messageCount || 0

  // Update total messages on lead
  await supabase
    .from('crm_leads')
    .update({
      total_messages: totalMsgs,
      last_contact_at: new Date().toISOString(),
      whatsapp_status: 'active',
    })
    .eq('id', lead.id)

  console.log(`[CRM Handler] Lead ${lead.id} has ${totalMsgs} messages from contact`)

  // Check if we should trigger AI qualification
  // Qualify when: enough messages AND not yet qualified
  if (totalMsgs >= MESSAGES_BEFORE_QUALIFICATION && !lead.ai_qualified) {
    console.log(`[CRM Handler] Triggering AI qualification for lead ${lead.id}`)

    try {
      // Call the crm-ai-qualify-lead function
      const qualifyUrl = `${supabaseUrl}/functions/v1/crm-ai-qualify-lead`
      const res = await fetch(qualifyUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: lead.id,
          contact_id: contactId,
          user_id: userId,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        console.log(`[CRM Handler] Lead ${lead.id} qualified successfully:`, JSON.stringify(result.qualification))
      } else {
        console.error(`[CRM Handler] Qualification failed:`, await res.text())
      }
    } catch (err) {
      console.error('[CRM Handler] Error calling qualification function:', err)
    }
  } else if (lead.ai_qualified && totalMsgs % 10 === 0) {
    // Re-qualify every 10 messages to update score
    console.log(`[CRM Handler] Re-qualifying lead ${lead.id} (${totalMsgs} messages)`)

    try {
      const qualifyUrl = `${supabaseUrl}/functions/v1/crm-ai-qualify-lead`
      await fetch(qualifyUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: lead.id,
          contact_id: contactId,
          user_id: userId,
        }),
      })
    } catch (err) {
      console.error('[CRM Handler] Error re-qualifying:', err)
    }
  }
}
