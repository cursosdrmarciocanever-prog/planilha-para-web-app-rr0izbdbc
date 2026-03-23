import { useState, useEffect } from 'react'
import { DespesasFixasTable } from './DespesasFixasTable'
import { SalasTable } from './SalasTable'
import { VisaoCustos } from './VisaoCustos'
import { supabase } from '@/lib/supabase/client'
import { getSalas } from '@/services/taxa-sala'
import { Loader2 } from 'lucide-react'

export default function RegistroTaxaSala() {
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
          // Ignora erro de parse silenciosamente
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
    const overrides = newValores.reduce((acc, v) => ({ ...acc, [v.id]: v.valor }), {})
    localStorage.setItem('gm_metrics_overrides', JSON.stringify(overrides))
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up">
      <div className="xl:col-span-4 flex flex-col gap-8">
        <div className="flex-1">
          <DespesasFixasTable valores={valores} setValores={handleSetValores} />
        </div>
        <div className="shrink-0">
          <SalasTable salas={salas} reload={loadData} />
        </div>
      </div>
      <div className="xl:col-span-8 flex flex-col">
        <VisaoCustos
          valores={valores}
          salas={salas}
          selectedSalaId={selectedSalaId}
          setSelectedSalaId={setSelectedSalaId}
          turnos={turnos}
          setTurnos={setTurnos}
          semanas={semanas}
          setSemanas={setSemanas}
        />
      </div>
    </div>
  )
}
