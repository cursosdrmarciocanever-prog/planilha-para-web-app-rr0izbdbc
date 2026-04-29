import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const bodyText = await req.text()
    const params = new URLSearchParams(bodyText)

    const from = params.get('From') || ''
    const bodyStr = params.get('Body') || ''

    if (!from || !bodyStr) {
      return new Response('Missing From or Body', { status: 400 })
    }

    const telefoneTwilio = from.replace('whatsapp:', '').replace('+', '')

    // Tenta encontrar um agendamento recente para este número
    const hoje = new Date().toISOString()
    let agendamentoContext = null

    const phoneDigits = telefoneTwilio.slice(-8)
    if (phoneDigits.length >= 8) {
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('id, paciente_nome, data_hora, tipo_consulta, status, numero_whatsapp, whatsapp')
        .gte('data_hora', hoje)
        .order('data_hora', { ascending: true })
        .limit(10)

      if (agendamentos) {
        agendamentoContext = agendamentos.find(
          (a) =>
            (a.numero_whatsapp && a.numero_whatsapp.includes(phoneDigits)) ||
            (a.whatsapp && a.whatsapp.includes(phoneDigits)),
        )
      }
    }

    const textoMsg = bodyStr.toLowerCase()
    let templateMatch = null

    const { data: templates } = await supabase.from('templates_mensagens').select('*')

    if (templates && templates.length > 0) {
      if (textoMsg.includes('cancelar') || textoMsg.includes('desmarcar')) {
        templateMatch = templates.find(
          (t) =>
            t.categoria.toLowerCase() === 'cancelamento' ||
            t.titulo.toLowerCase().includes('cancel'),
        )
      } else if (textoMsg.includes('confirmar')) {
        templateMatch = templates.find(
          (t) =>
            t.categoria.toLowerCase() === 'confirmação' ||
            t.titulo.toLowerCase().includes('confirm'),
        )
      } else if (textoMsg.includes('adiar') || textoMsg.includes('remarcar')) {
        templateMatch = templates.find(
          (t) =>
            t.categoria.toLowerCase() === 'adiamento' ||
            t.titulo.toLowerCase().includes('adiar') ||
            t.titulo.toLowerCase().includes('remarcar'),
        )
      } else if (
        textoMsg.includes('horário') ||
        textoMsg.includes('horas') ||
        textoMsg.includes('funcionamento')
      ) {
        templateMatch = templates.find(
          (t) =>
            t.titulo.toLowerCase().includes('horário') ||
            (t.categoria.toLowerCase() === 'dúvidas frequentes' &&
              t.conteudo.toLowerCase().includes('horário')),
        )
      } else if (
        textoMsg.includes('endereço') ||
        textoMsg.includes('local') ||
        textoMsg.includes('onde')
      ) {
        templateMatch = templates.find(
          (t) =>
            t.titulo.toLowerCase().includes('endereço') ||
            t.titulo.toLowerCase().includes('local') ||
            (t.categoria.toLowerCase() === 'dúvidas frequentes' &&
              t.conteudo.toLowerCase().includes('endereço')),
        )
      } else if (
        textoMsg.includes('valor') ||
        textoMsg.includes('preço') ||
        textoMsg.includes('custa')
      ) {
        templateMatch = templates.find(
          (t) =>
            t.titulo.toLowerCase().includes('valor') ||
            t.titulo.toLowerCase().includes('preço') ||
            (t.categoria.toLowerCase() === 'dúvidas frequentes' &&
              t.conteudo.toLowerCase().includes('valor')),
        )
      } else if (textoMsg.includes('preparo') || textoMsg.includes('preparação')) {
        templateMatch = templates.find(
          (t) =>
            t.titulo.toLowerCase().includes('preparo') ||
            (t.categoria.toLowerCase() === 'dúvidas frequentes' &&
              t.conteudo.toLowerCase().includes('preparo')),
        )
      } else if (textoMsg.includes('agendar') || textoMsg.includes('marcar')) {
        templateMatch = templates.find(
          (t) =>
            t.categoria.toLowerCase() === 'agendamento' ||
            t.titulo.toLowerCase().includes('agendar') ||
            t.titulo.toLowerCase().includes('marcar'),
        )
      } else if (textoMsg.includes('dúvida')) {
        templateMatch = templates.find(
          (t) =>
            t.categoria.toLowerCase() === 'dúvidas frequentes' ||
            t.titulo.toLowerCase().includes('dúvida'),
        )
      }
    }

    // Registra a mensagem de entrada
    await supabase.from('conversas_whatsapp').insert({
      agendamento_id: agendamentoContext?.id || null,
      numero_whatsapp: telefoneTwilio,
      mensagem: bodyStr,
      tipo_mensagem: 'entrada',
      precisa_resposta_manual: templateMatch ? false : true,
    } as any)

    if (templateMatch) {
      let resposta = templateMatch.conteudo

      const nomePaciente = agendamentoContext?.paciente_nome || 'Paciente'
      let dataConsulta = 'N/A'
      let horaConsulta = 'N/A'
      let tipoConsulta = agendamentoContext?.tipo_consulta || 'Consulta'

      if (agendamentoContext?.data_hora) {
        const dh = new Date(agendamentoContext.data_hora)
        dataConsulta = dh.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        horaConsulta = dh.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo',
        })
      }

      resposta = resposta.replace(/{nome_paciente}/g, nomePaciente)
      resposta = resposta.replace(/{data_consulta}/g, dataConsulta)
      resposta = resposta.replace(/{hora_consulta}/g, horaConsulta)
      resposta = resposta.replace(/{tipo_consulta}/g, tipoConsulta)

      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
      const twilioWhatsappNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')

      if (twilioAccountSid && twilioAuthToken && twilioWhatsappNumber) {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
        const bodyParams = new URLSearchParams()
        bodyParams.append('To', from)
        bodyParams.append('From', `whatsapp:${twilioWhatsappNumber}`)
        bodyParams.append('Body', resposta)

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          },
          body: bodyParams.toString(),
        })

        if (twilioResponse.ok) {
          await supabase.from('conversas_whatsapp').insert({
            agendamento_id: agendamentoContext?.id || null,
            numero_whatsapp: telefoneTwilio,
            mensagem: resposta,
            tipo_mensagem: 'saída',
            precisa_resposta_manual: false,
          } as any)
        } else {
          console.error('Erro ao enviar via Twilio:', await twilioResponse.text())
        }
      }
    }

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
})
