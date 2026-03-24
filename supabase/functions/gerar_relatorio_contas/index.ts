import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { jsPDF } from 'npm:jspdf@2.5.2'
import autoTable from 'npm:jspdf-autotable@3.8.2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    )

    const { mes, ano } = await req.json()

    if (!mes || !ano) {
      throw new Error('Mês e ano são obrigatórios')
    }

    const startOfMonth = new Date(ano, mes - 1, 1).toISOString()
    const endOfMonth = new Date(ano, mes, 0, 23, 59, 59).toISOString()

    const { data: despesas, error: despesasError } = await supabaseClient
      .from('despesas')
      .select('*')
      .gte('data_vencimento', startOfMonth)
      .lte('data_vencimento', endOfMonth)

    if (despesasError) throw despesasError

    const { data: contasFixas, error: contasFixasError } = await supabaseClient
      .from('contas_fixas')
      .select('*')

    if (contasFixasError) throw contasFixasError

    const contasFiltradas = contasFixas
      .filter((c) => {
        if (!c.data_vencimento) return false
        const dataVenc = new Date(c.data_vencimento)

        if (c.frequencia === 'Única') {
          return dataVenc.getMonth() + 1 === mes && dataVenc.getFullYear() === ano
        }

        return dataVenc <= new Date(ano, mes, 0)
      })
      .map((c) => {
        if (c.frequencia !== 'Única' && c.data_vencimento) {
          const d = new Date(c.data_vencimento)
          d.setFullYear(ano)
          d.setMonth(mes - 1)
          return { ...c, data_vencimento: d.toISOString() }
        }
        return c
      })

    const todos = [
      ...(despesas || []).map((d) => ({ ...d, tipo: 'Despesa' })),
      ...(contasFiltradas || []).map((d) => ({ ...d, tipo: 'Conta Fixa' })),
    ]

    todos.sort((a, b) => {
      const dateA = new Date(a.data_vencimento).getTime()
      const dateB = new Date(b.data_vencimento).getTime()
      return dateA - dateB
    })

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(`Relatório de Contas - ${mes.toString().padStart(2, '0')}/${ano}`, 14, 22)

    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30)

    const tableData = todos.map((item) => {
      const date = item.data_vencimento ? new Date(item.data_vencimento) : null
      const dateStr = date
        ? `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`
        : '-'

      return [
        dateStr,
        item.descricao || '-',
        item.categoria || '-',
        item.tipo || '-',
        item.status || 'Pendente',
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          item.valor || 0,
        ),
      ]
    })

    const total = todos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0)

    tableData.push([
      '',
      '',
      '',
      '',
      'TOTAL',
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
    ])

    autoTable(doc, {
      startY: 35,
      head: [['Vencimento', 'Descrição', 'Categoria', 'Tipo', 'Status', 'Valor']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 },
      columnStyles: {
        5: { halign: 'right', fontStyle: 'bold' },
      },
      willDrawCell: function (data: any) {
        if (data.row.index === tableData.length - 1) {
          doc.setFont('helvetica', 'bold')
          if (data.column.index === 4 || data.column.index === 5) {
            doc.setTextColor(0, 0, 0)
          }
        }
      },
    })

    const pdfBytes = doc.output('arraybuffer')

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_${mes}_${ano}.pdf"`,
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
