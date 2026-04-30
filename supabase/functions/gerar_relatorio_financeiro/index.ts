import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { PDFDocument, StandardFonts } from 'npm:pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { start_date, end_date } = await req.json()

    let agendamentosQuery = supabaseClient.from('agendamentos').select('status, tipo_consulta, data_hora')
    if (start_date && end_date) {
      agendamentosQuery = agendamentosQuery.gte('data_hora', start_date).lte('data_hora', end_date)
    }
    const { data: agendamentos, error: errA } = await agendamentosQuery
    if (errA) throw errA

    let transacoesQuery = supabaseClient.from('transacoes').select('status, valor, data, tipo')
    if (start_date && end_date) {
      transacoesQuery = transacoesQuery.gte('data', start_date.split('T')[0]).lte('data', end_date.split('T')[0])
    }
    const { data: transacoes, error: errT } = await transacoesQuery
    if (errT) throw errT

    const receitaTotal = transacoes?.filter(t => t.status === 'confirmado' || t.status === 'pago' || t.status === 'Pago').reduce((acc, t) => acc + Number(t.valor), 0) || 0
    const confirmados = agendamentos?.filter(a => a.status === 'confirmado').length || 0
    const pendentes = agendamentos?.filter(a => a.status === 'pendente').length || 0
    const totalAgendamentos = agendamentos?.length || 0
    const taxaConversao = totalAgendamentos > 0 ? (confirmados / totalAgendamentos) * 100 : 0

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = 800
    page.drawText(`Relatorio Financeiro`, { x: 50, y, size: 20, font: fontBold })
    y -= 30
    const sd = start_date ? new Date(start_date).toLocaleDateString('pt-BR') : 'Inicio'
    const ed = end_date ? new Date(end_date).toLocaleDateString('pt-BR') : 'Fim'
    page.drawText(`Periodo: ${sd} a ${ed}`, { x: 50, y, size: 12, font })
    y -= 40

    page.drawText(`Resumo:`, { x: 50, y, size: 14, font: fontBold })
    y -= 25
    page.drawText(`Receita Total (Confirmada/Paga): R$ ${receitaTotal.toFixed(2).replace('.', ',')}`, { x: 50, y, size: 12, font })
    y -= 20
    page.drawText(`Agendamentos Confirmados: ${confirmados}`, { x: 50, y, size: 12, font })
    y -= 20
    page.drawText(`Agendamentos Pendentes: ${pendentes}`, { x: 50, y, size: 12, font })
    y -= 20
    page.drawText(`Taxa de Conversao: ${taxaConversao.toFixed(1)}%`, { x: 50, y, size: 12, font })

    const pdfBase64 = await pdfDoc.saveAsBase64()

    return new Response(JSON.stringify({ pdfBase64 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
