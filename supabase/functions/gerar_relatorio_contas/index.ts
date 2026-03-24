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

    // 1) Buscar todas as contas_fixas do mês/ano selecionado
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

        // Contas recorrentes que iniciaram antes ou no mês/ano atual
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

    contasFiltradas.sort((a, b) => {
      const dateA = new Date(a.data_vencimento).getTime()
      const dateB = new Date(b.data_vencimento).getTime()
      return dateA - dateB
    })

    // 2) Calcular totais por categoria e status (pago/pendente/vencido)
    const totaisPorStatus: Record<string, number> = {
      Pago: 0,
      Pendente: 0,
      Vencido: 0,
    }
    const totaisPorCategoria: Record<string, number> = {}

    let totalGeral = 0

    contasFiltradas.forEach((c) => {
      const valor = Number(c.valor) || 0
      const status = c.status || 'Pendente'
      const categoria = c.categoria || 'Sem Categoria'

      totaisPorStatus[status] = (totaisPorStatus[status] || 0) + valor
      totaisPorCategoria[categoria] = (totaisPorCategoria[categoria] || 0) + valor
      totalGeral += valor
    })

    // 3) Usar jsPDF para gerar PDF
    const doc = new jsPDF()

    doc.setFontSize(18)
    const titulo = `Relatório de Contas a Pagar - ${mes.toString().padStart(2, '0')}/${ano}`
    doc.text(titulo, 14, 22)

    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30)

    // Tabela com contas
    const tableData = contasFiltradas.map((item) => {
      const date = item.data_vencimento ? new Date(item.data_vencimento) : null
      const dateStr = date
        ? `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`
        : '-'

      return [
        dateStr,
        item.descricao || '-',
        item.categoria || '-',
        item.status || 'Pendente',
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          item.valor || 0,
        ),
      ]
    })

    tableData.push([
      '',
      '',
      '',
      'TOTAL',
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral),
    ])

    autoTable(doc, {
      startY: 35,
      head: [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' },
      },
      willDrawCell: function (data: any) {
        if (data.row.index === tableData.length - 1) {
          doc.setFont('helvetica', 'bold')
          if (data.column.index === 3 || data.column.index === 4) {
            doc.setTextColor(0, 0, 0)
          }
        }
      },
    })

    let currentY = (doc as any).lastAutoTable.finalY + 15

    const checkPageBreak = (neededSpace: number) => {
      if (currentY + neededSpace > doc.internal.pageSize.height - 20) {
        doc.addPage()
        currentY = 20
      }
    }

    // Gráficos de resumo (total por status)
    checkPageBreak(60)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Resumo por Status', 14, currentY)
    currentY += 8

    const maxStatus = Math.max(...Object.values(totaisPorStatus), 1)
    const barMaxWidth = 100

    Object.entries(totaisPorStatus).forEach(([status, valor]) => {
      // Exibe os status base mesmo que zerados, ou os extras que tiverem valor
      if (valor >= 0 && (['Pago', 'Pendente', 'Vencido'].includes(status) || valor > 0)) {
        doc.setFontSize(10)
        doc.setTextColor(50, 50, 50)
        const valStr = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valor)
        doc.text(`${status}: ${valStr}`, 14, currentY)

        currentY += 2
        const width = (valor / maxStatus) * barMaxWidth

        if (status === 'Pago')
          doc.setFillColor(34, 197, 94) // Verde
        else if (status === 'Vencido')
          doc.setFillColor(239, 68, 68) // Vermelho
        else doc.setFillColor(234, 179, 8) // Amarelo

        doc.rect(14, currentY, Math.max(width, 1), 5, 'F')
        currentY += 10
      }
    })

    // Gráficos de resumo (total por categoria)
    currentY += 10
    checkPageBreak(60)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Resumo por Categoria', 14, currentY)
    currentY += 8

    const maxCat = Math.max(...Object.values(totaisPorCategoria), 1)

    Object.entries(totaisPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .forEach(([categoria, valor]) => {
        checkPageBreak(15)
        doc.setFontSize(10)
        doc.setTextColor(50, 50, 50)
        const valStr = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valor)
        doc.text(`${categoria}: ${valStr}`, 14, currentY)

        currentY += 2
        const width = (valor / maxCat) * barMaxWidth
        doc.setFillColor(59, 130, 246) // Azul
        doc.rect(14, currentY, Math.max(width, 1), 5, 'F')
        currentY += 10
      })

    // 4) Retornar PDF como blob para download
    const pdfBytes = doc.output('arraybuffer')

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_contas_${mes}_${ano}.pdf"`,
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
