import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from '@supabase/supabase-js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    })

    const { mes, ano } = await req.json()

    if (!mes || !ano) {
      return new Response(JSON.stringify({ error: 'Mês e ano são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calcula datas
    const startDate = new Date(ano, mes - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(ano, mes, 0).toISOString().split('T')[0]

    // Fetch contas
    const { data: contas, error } = await supabase
      .from('contas_fixas')
      .select('*')
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate)
      .order('data_vencimento', { ascending: true })

    if (error) throw error

    // Calcula totais
    let totalPago = 0
    let totalPendente = 0
    let totalVencido = 0
    const totaisPorCategoria: Record<string, number> = {}

    for (const conta of contas || []) {
      const valor = Number(conta.valor)
      if (conta.status === 'Pago') totalPago += valor
      else if (conta.status === 'Vencido') totalVencido += valor
      else totalPendente += valor

      const cat = conta.categoria || 'Sem Categoria'
      totaisPorCategoria[cat] = (totaisPorCategoria[cat] || 0) + valor
    }

    const formatCurrency = (val: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(`Relatório de Contas a Pagar - ${String(mes).padStart(2, '0')}/${ano}`, 14, 22)

    doc.setFontSize(12)
    doc.text('Resumo por Status:', 14, 35)
    doc.setFontSize(10)
    doc.text(`Pago: ${formatCurrency(totalPago)}`, 14, 42)
    doc.text(`Pendente: ${formatCurrency(totalPendente)}`, 14, 49)
    doc.text(`Vencido: ${formatCurrency(totalVencido)}`, 14, 56)

    doc.setFontSize(12)
    doc.text('Resumo por Categoria:', 100, 35)
    doc.setFontSize(10)
    let yCat = 42
    for (const [cat, val] of Object.entries(totaisPorCategoria)) {
      doc.text(`${cat}: ${formatCurrency(val)}`, 100, yCat)
      yCat += 7
    }

    const tableData = (contas || []).map((c) => [
      c.data_vencimento.split('-').reverse().join('/'),
      c.descricao,
      c.categoria || '-',
      c.status,
      formatCurrency(Number(c.valor)),
    ])

    autoTable(doc, {
      startY: Math.max(yCat, 65) + 10,
      head: [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    const pdfArrayBuffer = doc.output('arraybuffer')

    return new Response(pdfArrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_${mes}_${ano}.pdf"`,
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
