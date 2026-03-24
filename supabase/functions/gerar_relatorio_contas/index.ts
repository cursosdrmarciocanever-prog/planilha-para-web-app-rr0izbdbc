import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1'
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
          return dataVenc.getUTCMonth() + 1 === mes && dataVenc.getUTCFullYear() === ano
        }

        // Contas recorrentes que iniciaram antes ou no mês/ano atual
        return dataVenc <= new Date(Date.UTC(ano, mes, 0))
      })
      .map((c) => {
        if (c.frequencia !== 'Única' && c.data_vencimento) {
          const d = new Date(c.data_vencimento)
          d.setUTCFullYear(ano)
          d.setUTCMonth(mes - 1)
          return { ...c, data_vencimento: d.toISOString().split('T')[0] }
        }
        return c
      })

    contasFiltradas.sort((a, b) => {
      const dateA = new Date(a.data_vencimento || 0).getTime()
      const dateB = new Date(b.data_vencimento || 0).getTime()
      return dateA - dateB
    })

    // 2) Calcular totais por status (pago/pendente/vencido)
    const totaisPorStatus: Record<string, number> = {
      Pago: 0,
      Pendente: 0,
      Vencido: 0,
    }
    let totalGeral = 0

    contasFiltradas.forEach((c) => {
      const valor = Number(c.valor) || 0
      const status = c.status || 'Pendente'
      totaisPorStatus[status] = (totaisPorStatus[status] || 0) + valor
      totalGeral += valor
    })

    // 3) Usar pdf-lib para gerar PDF de forma segura em ambientes serverless/edge
    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage([595.28, 841.89]) // A4 format
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = 800
    page.drawText(`Relatório de Contas a Pagar - ${mes.toString().padStart(2, '0')}/${ano}`, {
      x: 50,
      y,
      size: 16,
      font: fontBold,
    })
    y -= 20
    page.drawText(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })

    // Cabeçalho da Tabela
    y -= 40
    page.drawText('Vencimento', { x: 50, y, size: 10, font: fontBold })
    page.drawText('Descrição', { x: 130, y, size: 10, font: fontBold })
    page.drawText('Status', { x: 350, y, size: 10, font: fontBold })
    page.drawText('Valor', { x: 450, y, size: 10, font: fontBold })

    y -= 10
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    })
    y -= 15

    // Linhas da tabela
    for (const item of contasFiltradas) {
      // Quebra de página se não houver espaço suficiente
      if (y < 50) {
        page = pdfDoc.addPage([595.28, 841.89])
        y = 800
      }

      const dateOnly = item.data_vencimento ? item.data_vencimento.split('T')[0] : ''
      const dateStr = dateOnly ? dateOnly.split('-').reverse().join('/') : '-'
      const desc = item.descricao ? item.descricao.substring(0, 35) : '-'
      const status = item.status || 'Pendente'
      const valorStr = `R$ ${Number(item.valor || 0)
        .toFixed(2)
        .replace('.', ',')}`

      page.drawText(dateStr, { x: 50, y, size: 9, font })
      page.drawText(desc, { x: 130, y, size: 9, font })
      page.drawText(status, { x: 350, y, size: 9, font })
      page.drawText(valorStr, { x: 450, y, size: 9, font })

      y -= 15
    }

    y -= 10
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    })
    y -= 20

    // Rodapé / Totais
    page.drawText('TOTAL GERAL:', { x: 350, y, size: 11, font: fontBold })
    page.drawText(`R$ ${totalGeral.toFixed(2).replace('.', ',')}`, {
      x: 450,
      y,
      size: 11,
      font: fontBold,
    })

    y -= 40
    page.drawText('Resumo por Status:', { x: 50, y, size: 12, font: fontBold })
    y -= 20
    Object.entries(totaisPorStatus).forEach(([status, valor]) => {
      page.drawText(`${status}: R$ ${valor.toFixed(2).replace('.', ',')}`, {
        x: 50,
        y,
        size: 10,
        font,
      })
      y -= 15
    })

    // 4) Retornar PDF como blob para download
    const pdfBytes = await pdfDoc.save()

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
