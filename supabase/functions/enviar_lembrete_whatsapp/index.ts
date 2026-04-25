import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase ausente nas variáveis de ambiente.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { agendamento_id } = await req.json()

    if (!agendamento_id) {
      throw new Error('O parâmetro agendamento_id é obrigatório.')
    }

    // Busca dados do agendamento e do paciente relacionado
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      .select('*, pacientes(*)')
      .eq('id', agendamento_id)
      .single()

    if (agendamentoError || !agendamento) {
      throw new Error(`Erro ao buscar agendamento: ${agendamentoError?.message || 'Agendamento não encontrado'}`)
    }

    // Identifica telefone do paciente
    let telefone = agendamento.numero_whatsapp || agendamento.whatsapp || agendamento.pacientes?.telefone
    if (!telefone) {
      throw new Error('Paciente não possui número de telefone/WhatsApp cadastrado.')
    }

    // Formata o número para o padrão E.164 (somente números, precedido do country code)
    telefone = telefone.replace(/\D/g, '')
    if (!telefone.startsWith('55') && telefone.length >= 10) {
      telefone = `55${telefone}`
    }
    const toWhatsApp = `whatsapp:+${telefone}`

    // Formata Data e Hora para o fuso do Brasil
    const dataHora = new Date(agendamento.data_hora)
    const dataFormatada = dataHora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

    const nomePaciente = agendamento.paciente_nome || agendamento.pacientes?.nome || 'Paciente'
    const tipoConsulta = agendamento.tipo_consulta || 'Consulta'

    // Formata a mensagem de lembrete
    const mensagem = `Olá, ${nomePaciente}! Tudo bem?\n\nPassando para lembrar da sua ${tipoConsulta} agendada para o dia ${dataFormatada} às ${horaFormatada}.\n\n📍 Endereço: Av. Pedro Taques, 294 – Ed. Atrium, Maringá–PR.\n\nPor favor, nos confirme sua presença respondendo esta mensagem. Aguardamos você!`

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioWhatsappNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsappNumber) {
      throw new Error('Configurações do Twilio (Secrets) não encontradas. Verifique TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_WHATSAPP_NUMBER.')
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    
    const bodyParams = new URLSearchParams()
    bodyParams.append('To', toWhatsApp)
    bodyParams.append('From', `whatsapp:${twilioWhatsappNumber}`)
    bodyParams.append('Body', mensagem)

    // Envia a mensagem via API do Twilio
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
      },
      body: bodyParams.toString()
    })

    const twilioResult = await twilioResponse.json()
    let statusEnvio = 'enviado'

    if (!twilioResponse.ok) {
      console.error('Erro no envio via Twilio:', twilioResult)
      statusEnvio = 'erro'
    }

    // Registra o envio na tabela lembretes_whatsapp
    const { error: logError } = await supabase.from('lembretes_whatsapp').insert({
      agendamento_id: agendamento.id,
      data_envio: new Date().toISOString(),
      status_envio: statusEnvio,
      mensagem: mensagem
    })

    if (logError) {
      console.error('Erro ao registrar lembrete no banco de dados:', logError)
    }

    if (statusEnvio === 'erro') {
      throw new Error(`Falha ao enviar mensagem via Twilio: ${twilioResult.message || 'Erro desconhecido'}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lembrete enviado com sucesso.', 
        twilioMessageId: twilioResult.sid 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
