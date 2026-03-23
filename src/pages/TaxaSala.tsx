import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import RegistroTaxaSala from './taxa-sala/RegistroTaxaSala'
import OcupacaoManager from './taxa-sala/OcupacaoManager'
import Dashboard from './taxa-sala/Dashboard'
import Simulador from './taxa-sala/Simulador'
import {
  Calculator,
  ChartBar,
  CalendarDays,
  Printer,
  Download,
  FileSpreadsheet,
  FlaskConical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePDF } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { getSalas } from '@/services/taxa-sala'

export default function TaxaSala() {
  const [valores, setValores] = useState<any[]>([])
  const [salas, setSalas] = useState<any[]>([])
  const [selectedSalaId, setSelectedSalaId] = useState<string>('')
  const [turnos, setTurnos] = useState('2')
  const [semanas, setSemanas] = useState('4')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [despesasRes, salasData] = await Promise.all([
        supabase.from('despesas').select('descricao, categoria, valor'),
        getSalas(true),
      ])

      const despesasData = despesasRes.data || []

      const defaultCategorias = [
        { id: 'aluguel', nome: 'Aluguel da sala', valor: 0, match: ['aluguel'] },
        {
          id: 'agua',
          nome: 'Água, luz e internet',
          valor: 0,
          match: ['agua', 'água', 'luz', 'internet', 'energia'],
        },
        {
          id: 'salarios',
          nome: 'Salários e benefícios',
          valor: 0,
          match: ['salário', 'salario', 'benefício', 'beneficio', 'pessoal'],
        },
        {
          id: 'manutencao',
          nome: 'Manutenção e limpeza',
          valor: 0,
          match: ['manutenção', 'manutencao', 'limpeza'],
        },
        { id: 'seguros', nome: 'Seguros', valor: 0, match: ['seguro'] },
        {
          id: 'licencas',
          nome: 'Licenças, taxas e condomínio',
          valor: 0,
          match: ['licença', 'licenca', 'taxa', 'condomínio', 'condominio', 'imposto'],
        },
        {
          id: 'contabilidade',
          nome: 'Contabilidade',
          valor: 0,
          match: ['contabilidade', 'contador'],
        },
        { id: 'juridico', nome: 'Jurídico', valor: 0, match: ['jurídico', 'juridico', 'advogado'] },
        {
          id: 'marketing',
          nome: 'Marketing e assessoria',
          valor: 0,
          match: ['marketing', 'assessoria'],
        },
        {
          id: 'sistema',
          nome: 'Sistema de gestão',
          valor: 0,
          match: ['sistema', 'gestão', 'gestao', 'software'],
        },
        {
          id: 'verba',
          nome: 'Verba de impulsionamento',
          valor: 0,
          match: ['impulsionamento', 'ads', 'google', 'meta', 'facebook'],
        },
        {
          id: 'financiamento',
          nome: 'Financiamento',
          valor: 0,
          match: ['financiamento', 'empréstimo', 'emprestimo'],
        },
        { id: 'outros', nome: 'Outros', valor: 0, match: [] },
      ]

      const mapped = defaultCategorias.map((c) => ({ id: c.id, nome: c.nome, valor: 0 }))
      despesasData.forEach((d) => {
        const text = `${d.descricao || ''} ${d.categoria || ''}`.toLowerCase()
        const found = defaultCategorias.find(
          (c) => c.match.length && c.match.some((m) => text.includes(m)),
        )
        if (found) {
          const idx = mapped.findIndex((m) => m.id === found.id)
          mapped[idx].valor += Number(d.valor || 0)
        }
      })

      const saved = localStorage.getItem('gm_metrics_overrides')
      if (saved) {
        try {
          const overrides = JSON.parse(saved)
          mapped.forEach((m) => {
            if (overrides[m.id] !== undefined) {
              m.valor = overrides[m.id]
            }
          })
        } catch (e) {
          // Ignorar erros de parse do localStorage
          console.error('Failed to parse gm_metrics_overrides', e)
        }
      }

      setValores(mapped)
      setSalas(salasData)
      if (salasData.length > 0 && !selectedSalaId) {
        setSelectedSalaId(salasData[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSetValores = (newValores: any[]) => {
    setValores(newValores)
    const overrides = newValores.reduce((acc: any, v: any) => ({ ...acc, [v.id]: v.valor }), {})
    localStorage.setItem('gm_metrics_overrides', JSON.stringify(overrides))
  }

  const totalDespesas = valores.reduce((acc, v) => acc + (Number(v.valor) || 0), 0)
  const sala = salas.find((s) => s.id === selectedSalaId) || salas[0] || {}
  const diasTrab = Number(sala.dias_mes || 22)
  const horasMes = Number(sala.horas_mes || 220)
  const numSalas = Math.max(1, salas.length)
  const numTurnos = Number(turnos) || 2
  const numSemanas = Number(semanas) || 4

  const opFixasDia = totalDespesas / diasTrab
  const custoSalaMes = totalDespesas / numSalas
  const custoPorTurnoMes = custoSalaMes / numTurnos
  const turnoSemanal = custoPorTurnoMes / numSemanas
  const salaDia = totalDespesas / diasTrab
  const custoHora100 = horasMes > 0 ? totalDespesas / horasMes : 0
  const custoHora50 = custoHora100 / 0.5
  const custoHora20 = custoHora100 / 0.2

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const handleExportCSV = () => {
    let csv = 'DESPESAS OPERACIONAIS FIXAS\nCategoria;Valor (R$)\n'
    valores.forEach((v) => (csv += `${v.nome};${v.valor}\n`))
    csv += `TOTAL;${totalDespesas}\n\n`

    csv += 'VISÃO DE CUSTOS\nIndicador;Valor (R$)\n'
    csv += `Custos Totais;${totalDespesas.toFixed(2)}\n`
    csv += `Operacionais/Dia;${opFixasDia.toFixed(2)}\n`
    csv += `Custo Sala/Mês;${custoSalaMes.toFixed(2)}\n`
    csv += `Custo por Turno/Mês;${custoPorTurnoMes.toFixed(2)}\n`
    csv += `Turno Semanal;${turnoSemanal.toFixed(2)}\n`
    csv += `Sala Dia;${salaDia.toFixed(2)}\n`
    csv += `Custo Hora 100%;${custoHora100.toFixed(2)}\n`
    csv += `Custo Hora 50%;${custoHora50.toFixed(2)}\n`
    csv += `Custo Hora 20%;${custoHora20.toFixed(2)}\n`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `taxa-sala-${new Date().toISOString().split('T')[0]}.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; margin: 0; }
        }
      `}</style>

      {/* PRINT SECTION */}
      <div id="print-section" className="hidden print:block text-black bg-white">
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">
              CLÍNICA CANEVER
            </h1>
            <p className="text-base text-gray-600 font-medium mt-1">
              Relatório de Taxa de Sala - Método GM Metrics
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Data de emissão:</p>
            <p className="font-bold text-lg">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <h2 className="text-lg font-bold mb-4 uppercase text-black border-b border-gray-300 pb-2">
              1. Despesas Operacionais Fixas
            </h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {valores.map((v) => (
                  <tr key={v.id} className="border-b border-gray-200">
                    <td className="py-2 text-gray-800">{v.nome}</td>
                    <td className="py-2 text-right font-medium text-black">
                      {formatCurrency(v.valor)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold text-black text-base">
                  <td className="py-3 px-2">TOTAL</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(totalDespesas)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4 uppercase text-black border-b border-gray-300 pb-2">
              2. Salas Cadastradas
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-left text-black">
                <tr>
                  <th className="py-2 px-3">Nome da Sala</th>
                  <th className="py-2 px-3 text-center">Horas/mês</th>
                  <th className="py-2 px-3 text-center">Dias/mês</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((s) => (
                  <tr key={s.id} className="border-b border-gray-200 text-gray-800">
                    <td className="py-3 px-3">{s.nome}</td>
                    <td className="py-3 px-3 text-center">{s.horas_mes || 220}</td>
                    <td className="py-3 px-3 text-center">{s.dias_mes || 22}</td>
                  </tr>
                ))}
                {salas.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      Nenhuma sala cadastrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4 uppercase text-black border-b border-gray-300 pb-2">
          3. Visão de Custos (Indicadores de Referência)
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { title: 'CUSTOS TOTAIS', value: totalDespesas },
            { title: 'OPERACIONAIS FIXAS/DIA', value: opFixasDia },
            { title: 'CUSTO SALA/MÊS', value: custoSalaMes },
            { title: 'CUSTO POR TURNO/MÊS', value: custoPorTurnoMes },
            { title: 'TURNO SEMANAL', value: turnoSemanal },
            { title: 'SALA DIA', value: salaDia },
            { title: 'CUSTO HORA OCUP. 100%', value: custoHora100, highlight: true },
            { title: 'CUSTO HORA OCUP. 50%', value: custoHora50 },
            { title: 'CUSTO HORA OCUP. 20%', value: custoHora20 },
          ].map((c, i) => (
            <div
              key={i}
              className={`p-5 border-2 rounded-xl ${c.highlight ? 'border-black bg-gray-50 shadow-md' : 'border-gray-200'}`}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-wider ${c.highlight ? 'text-black' : 'text-gray-500'}`}
              >
                {c.title}
              </p>
              <p
                className={`text-2xl font-black mt-2 tracking-tight ${c.highlight ? 'text-black' : 'text-gray-800'}`}
              >
                {formatCurrency(c.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* WEB APP SECTION */}
      <div className="print:hidden p-6 md:p-10 animate-fade-in flex flex-col gap-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Taxa de Sala</h1>
            <p className="text-muted-foreground text-base max-w-3xl">
              Controle despesas operacionais fixas e salas para calcular custo por hora e por turno
              (Método GM Metrics).
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 rounded-full shadow-sm border-2">
                <Download className="w-4 h-4 mr-2" /> Exportar Relatórios
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl">
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer py-2.5">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" /> Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={generatePDF} className="cursor-pointer py-2.5">
                <Printer className="w-4 h-4 mr-2 text-rose-600" /> Gerar PDF (Visual)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs defaultValue="registro" className="w-full flex flex-col gap-6">
          <TabsList className="h-auto p-1.5 bg-secondary/40 rounded-2xl w-full xl:w-fit inline-flex flex-wrap shadow-sm border border-border/50">
            <TabsTrigger
              value="registro"
              className="px-5 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
            >
              <Calculator className="w-4 h-4" />{' '}
              <span className="font-medium">Registro de Taxa de Sala</span>
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="px-5 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
            >
              <ChartBar className="w-4 h-4" />{' '}
              <span className="font-medium">Visão Estratégica</span>
            </TabsTrigger>
            <TabsTrigger
              value="ocupacoes"
              className="px-5 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
            >
              <CalendarDays className="w-4 h-4" /> <span className="font-medium">Ocupações</span>
            </TabsTrigger>
            <TabsTrigger
              value="simulador"
              className="px-5 py-2.5 rounded-xl flex gap-2 items-center data-[state=active]:shadow-sm data-[state=active]:bg-background transition-all"
            >
              <FlaskConical className="w-4 h-4" /> <span className="font-medium">Simulador</span>
            </TabsTrigger>
          </TabsList>

          <div className="bg-transparent rounded-3xl w-full">
            <TabsContent value="registro" className="animate-fade-in-up mt-0 outline-none w-full">
              <RegistroTaxaSala
                valores={valores}
                setValores={handleSetValores}
                salas={salas}
                selectedSalaId={selectedSalaId}
                setSelectedSalaId={setSelectedSalaId}
                turnos={turnos}
                setTurnos={setTurnos}
                semanas={semanas}
                setSemanas={setSemanas}
                loadData={loadData}
                loading={loading}
              />
            </TabsContent>
            <TabsContent
              value="dashboard"
              className="animate-fade-in-up mt-0 outline-none bg-background p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 w-full"
            >
              <Dashboard custoHora100={custoHora100} />
            </TabsContent>
            <TabsContent
              value="ocupacoes"
              className="animate-fade-in-up mt-0 outline-none bg-background p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 w-full"
            >
              <OcupacaoManager />
            </TabsContent>
            <TabsContent value="simulador" className="animate-fade-in-up mt-0 outline-none w-full">
              <Simulador
                baseTotalDespesas={totalDespesas}
                sala={sala}
                baseSalasCount={salas.length}
                baseTurnos={turnos}
                baseSemanas={semanas}
                onApply={(newVals: any) => {
                  setTurnos(newVals.turnos)
                  setSemanas(newVals.semanas)
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  )
}
