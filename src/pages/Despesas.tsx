import { useState, useEffect, useMemo } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  CreditCard,
  Repeat,
  Wallet,
  TrendingUp,
  AlertTriangle,
  List,
  Edit,
  Plus,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenseModalStore } from '@/stores/use-expense-modal'
import { ExpenseFormModal } from '@/components/despesas/ExpenseFormModal'

export default function Despesas() {
  const { openModal, refreshTrigger } = useExpenseModalStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('consolidada')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [faturamentoMedio, setFaturamentoMedio] = useState(0)
  const [rawDespesas, setRawDespesas] = useState<any[]>([])
  const [rawFixas, setRawFixas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user, refreshTrigger])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [despRes, fixasRes, recRes] = await Promise.all([
        supabase.from('despesas').select('*').eq('user_id', user?.id),
        supabase.from('contas_fixas').select('*').eq('usuario_id', user?.id),
        supabase.from('transacoes').select('valor').eq('tipo', 'receita'),
      ])

      if (despRes.data) setRawDespesas(despRes.data)
      if (fixasRes.data) setRawFixas(fixasRes.data)

      if (recRes.data && recRes.data.length > 0) {
        const total = recRes.data.reduce((acc, curr) => acc + Number(curr.valor), 0)
        // Calcula média mensal simulada ou usa um piso de 15.000 para visualização
        const avg = Math.max((total / Math.max(recRes.data.length / 30, 1)) * 30, 15000)
        setFaturamentoMedio(avg)
      } else {
        setFaturamentoMedio(30000) // Fallback seguro
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Gera as projeções dinâmicas de parcelamentos e contas fixas para o mês visualizado
  const projectedItems = useMemo(() => {
    const rawItems: any[] = []

    rawDespesas.forEach((d) => {
      if (d.parcelamento) {
        const parts = d.parcelamento.split('/')
        if (parts.length === 2) {
          const current = parseInt(parts[0])
          const total = parseInt(parts[1])
          const start = d.data_vencimento ? parseISO(d.data_vencimento) : new Date()

          for (let i = 0; i <= total - current; i++) {
            const pDate = addMonths(start, i)
            if (isSameMonth(pDate, currentDate)) {
              rawItems.push({
                ...d,
                original_id: d.id,
                id: `${d.id}-p${i}`,
                parcelamento: `${current + i}/${total}`,
                data_vencimento: pDate.toISOString(),
                isProjected: i > 0,
                isFixa: false,
              })
            }
          }
        } else if (d.data_vencimento && isSameMonth(parseISO(d.data_vencimento), currentDate)) {
          rawItems.push({ ...d, original_id: d.id, isProjected: false, isFixa: false })
        }
      } else if (d.data_vencimento && isSameMonth(parseISO(d.data_vencimento), currentDate)) {
        rawItems.push({ ...d, original_id: d.id, isProjected: false, isFixa: false })
      }
    })

    rawFixas.forEach((f) => {
      if (f.status !== 'Inativo') {
        const fDate = new Date(currentDate)
        const orig = f.data_vencimento ? parseISO(f.data_vencimento) : new Date()
        fDate.setDate(orig.getDate())

        rawItems.push({
          id: `fixa-${f.id}`,
          original_id: f.id,
          descricao: f.descricao,
          valor: f.valor,
          data_vencimento: fDate.toISOString(),
          forma_pagamento: f.conta_pagamento || 'Débito Automático',
          status: f.status || 'Pendente',
          categoria: f.categoria,
          isProjected: true,
          isFixa: true,
        })
      }
    })

    const finalItems: any[] = []
    let unicredTotal = 0
    let sicoobTotal = 0

    const baseDate = new Date(currentDate)
    const unicredDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 10).toISOString()
    const sicoobDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 19).toISOString()

    rawItems.forEach((item) => {
      const fp = (item.forma_pagamento || item.conta_pagamento || '').toLowerCase()
      const desc = (item.descricao || '').toLowerCase()

      const isUnicredCard =
        (fp.includes('unicred') || desc.includes('unicred')) &&
        (fp.includes('cartão') || fp.includes('cartao') || fp.includes('cart'))
      const isSicoobCard =
        (fp.includes('sicoob') || desc.includes('sicoob')) &&
        (fp.includes('cartão') || fp.includes('cartao') || fp.includes('cart'))

      const isUnicredConta = (fp.includes('unicred') || desc.includes('unicred')) && !isUnicredCard
      const isSicoobConta = (fp.includes('sicoob') || desc.includes('sicoob')) && !isSicoobCard

      let finalItem = { ...item, isUnicredCard, isSicoobCard, isUnicredConta, isSicoobConta }

      if (isUnicredCard) {
        finalItem.data_vencimento = unicredDate
      } else if (isSicoobCard) {
        finalItem.data_vencimento = sicoobDate
      }

      finalItems.push(finalItem)
    })

    return finalItems.sort(
      (a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime(),
    )
  }, [rawDespesas, rawFixas, currentDate])

  const listaComprometimento = useMemo(() => {
    const grupos: Record<string, number> = {
      'Conta Unicred': 0,
      'Conta Sicoob': 0,
      'Cartão de Crédito Unicred': 0,
      'Cartão de Crédito Sicoob': 0,
      'Outros Cartões': 0,
      'Outras Despesas': 0,
    }

    projectedItems.forEach((item) => {
      const val = Number(item.valor || 0)
      if (item.isUnicredCard) {
        grupos['Cartão de Crédito Unicred'] += val
      } else if (item.isSicoobCard) {
        grupos['Cartão de Crédito Sicoob'] += val
      } else if (item.isUnicredConta) {
        grupos['Conta Unicred'] += val
      } else if (item.isSicoobConta) {
        grupos['Conta Sicoob'] += val
      } else {
        const fp = (item.forma_pagamento || item.conta_pagamento || '').toLowerCase()
        if (fp.includes('cartão') || fp.includes('cartao')) {
          grupos['Outros Cartões'] += val
        } else {
          grupos['Outras Despesas'] += val
        }
      }
    })

    return Object.entries(grupos)
      .map(([nome, valor]) => ({ nome, valor }))
      .filter((g) => g.valor > 0)
      .sort((a, b) => b.valor - a.valor)
  }, [projectedItems])

  // Lógica de Cores baseada no risco de comprometimento do faturamento
  const monthlyTotal = projectedItems.reduce((acc, curr) => acc + Number(curr.valor), 0)
  const riskRatio = faturamentoMedio > 0 ? monthlyTotal / faturamentoMedio : 0
  const riskColor = riskRatio > 0.9 ? 'red' : riskRatio > 0.7 ? 'yellow' : 'green'

  const getCalendarDays = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })
    const blanks = Array.from({ length: start.getDay() })
    return { blanks, days }
  }
  const { blanks, days } = getCalendarDays()

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleVerDetalhes = (nome: string) => {
    setSelectedGroup(nome)
  }

  const groupDetails = useMemo(() => {
    if (!selectedGroup) return []
    return projectedItems.filter((item) => {
      const fp = (item.forma_pagamento || item.conta_pagamento || '').toLowerCase()

      const isUnicredCard = item.isUnicredCard
      const isSicoobCard = item.isSicoobCard
      const isUnicredConta = item.isUnicredConta
      const isSicoobConta = item.isSicoobConta

      if (selectedGroup === 'Cartão de Crédito Unicred' && isUnicredCard) return true
      if (selectedGroup === 'Cartão de Crédito Sicoob' && isSicoobCard) return true
      if (selectedGroup === 'Conta Unicred' && isUnicredConta) return true
      if (selectedGroup === 'Conta Sicoob' && isSicoobConta) return true
      if (
        selectedGroup === 'Outros Cartões' &&
        !isUnicredCard &&
        !isSicoobCard &&
        (fp.includes('cartão') || fp.includes('cartao'))
      )
        return true
      if (
        selectedGroup === 'Outras Despesas' &&
        !isUnicredCard &&
        !isSicoobCard &&
        !isUnicredConta &&
        !isSicoobConta &&
        !(fp.includes('cartão') || fp.includes('cartao'))
      )
        return true

      return false
    })
  }, [projectedItems, selectedGroup])

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)

  const totalComprometido = listaComprometimento.reduce((a, b) => a + b.valor, 0)
  const isTotalNegative = faturamentoMedio > 0 && totalComprometido > faturamentoMedio

  const renderDayItems = (day: Date) => {
    let dayItems = projectedItems.filter((item) => isSameDay(parseISO(item.data_vencimento), day))

    if (viewMode === 'consolidada') {
      const unicredItems = dayItems.filter((i) => i.isUnicredCard)
      const sicoobItems = dayItems.filter((i) => i.isSicoobCard)
      const ccItems = dayItems.filter(
        (i) =>
          !i.isUnicredCard &&
          !i.isSicoobCard &&
          (i.forma_pagamento?.toLowerCase().includes('cartão') ||
            i.forma_pagamento?.toLowerCase().includes('cartao')),
      )
      const otherItems = dayItems.filter(
        (i) =>
          !i.isUnicredCard &&
          !i.isSicoobCard &&
          !(
            i.forma_pagamento?.toLowerCase().includes('cartão') ||
            i.forma_pagamento?.toLowerCase().includes('cartao')
          ),
      )

      if (unicredItems.length > 0) {
        otherItems.push({
          id: `cc-unicred-${day.toISOString()}`,
          descricao: 'Cartão de crédito Unicred',
          valor: unicredItems.reduce((acc, curr) => acc + Number(curr.valor), 0),
          forma_pagamento: 'Cartão de Crédito Unicred',
          isConsolidated: true,
        })
      }

      if (sicoobItems.length > 0) {
        otherItems.push({
          id: `cc-sicoob-${day.toISOString()}`,
          descricao: 'Cartão de crédito Sicoob',
          valor: sicoobItems.reduce((acc, curr) => acc + Number(curr.valor), 0),
          forma_pagamento: 'Cartão de Crédito Sicoob',
          isConsolidated: true,
        })
      }

      if (ccItems.length > 0) {
        otherItems.push({
          id: `cc-cons-${day.toISOString()}`,
          descricao: 'Fatura Cartão de Crédito',
          valor: ccItems.reduce((acc, curr) => acc + Number(curr.valor), 0),
          forma_pagamento: 'Cartão de Crédito',
          isConsolidated: true,
        })
      }
      dayItems = otherItems
    }

    return dayItems.map((item) => (
      <div
        key={item.id}
        onClick={() => {
          if (!item.isConsolidated && item.original_id) {
            openModal(item.original_id, item.isFixa ? 'conta_fixa' : 'despesa')
          } else if (item.isConsolidated) {
            handleVerDetalhes(item.forma_pagamento)
          }
        }}
        className={cn(
          'text-[11px] p-2 rounded-md border-l-4 shadow-sm mb-1.5 leading-tight transition-all hover:scale-[1.02]',
          item.isConsolidated || item.original_id ? 'cursor-pointer hover:opacity-80' : '',
          riskColor === 'red'
            ? 'border-l-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100'
            : riskColor === 'yellow'
              ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-100'
              : 'border-l-green-500 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-100',
        )}
      >
        <div className="font-semibold truncate" title={item.descricao}>
          {item.descricao}
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="font-bold">R$ {Number(item.valor).toFixed(2)}</span>
          <div className="flex gap-1">
            {item.isConsolidated && (
              <CreditCard className="w-3.5 h-3.5 opacity-70" title="Fatura Consolidada" />
            )}
            {item.isFixa && !item.isConsolidated && (
              <Repeat className="w-3.5 h-3.5 opacity-70" title="Conta Fixa Recorrente" />
            )}
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            Contas a Pagar
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Projeção de despesas, parcelamentos e contas fixas recorrentes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openModal(null, 'despesa')}
            className="rounded-full shadow-sm"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Nova Conta
          </Button>
          <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-xl border ml-2">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(val) => val && setViewMode(val)}
            >
              <ToggleGroupItem
                value="consolidada"
                className="rounded-lg text-xs px-3 h-8 gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Consolidada
              </ToggleGroupItem>
              <ToggleGroupItem
                value="detalhada"
                className="rounded-lg text-xs px-3 h-8 gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <LayoutList className="w-3.5 h-3.5" /> Detalhada
              </ToggleGroupItem>
              <ToggleGroupItem
                value="lista"
                className="rounded-lg text-xs px-3 h-8 gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <List className="w-3.5 h-3.5" /> Lista
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel Lateral de Resumo */}
        <div className="space-y-6">
          <Card
            className={cn(
              'border-border/60 shadow-sm rounded-2xl overflow-hidden transition-colors',
              riskColor === 'red'
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                : riskColor === 'yellow'
                  ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50'
                  : 'bg-card',
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Risco de Comprometimento
                {riskColor === 'red' && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                R$ {monthlyTotal.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Total projetado para {format(currentDate, 'MMMM', { locale: ptBR })}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Comprometido</span>
                  <span>{(riskRatio * 100).toFixed(1)}%</span>
                </div>
                <Progress
                  value={Math.min(riskRatio * 100, 100)}
                  className={cn(
                    'h-2.5',
                    riskColor === 'red'
                      ? '[&>div]:bg-red-500'
                      : riskColor === 'yellow'
                        ? '[&>div]:bg-yellow-500'
                        : '[&>div]:bg-green-500',
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Limite Seguro</span>
                  <span>R$ {faturamentoMedio.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Informações do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Qtd. Lançamentos</span>
                <span className="font-semibold">{projectedItems.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Contas Fixas</span>
                <span className="font-semibold">
                  {projectedItems.filter((i) => i.isFixa).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Parcelas Futuras</span>
                <span className="font-semibold">
                  {projectedItems.filter((i) => i.isProjected && !i.isFixa).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendário */}
        <Card className="lg:col-span-3 border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden flex flex-col min-h-[600px]">
          <CardHeader className="border-b bg-secondary/20 flex flex-row items-center justify-between py-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-bold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {viewMode === 'lista' ? (
              <div className="p-6 bg-muted/10 flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-card p-4 rounded-2xl border shadow-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      Filtro de Período
                    </h3>
                    <div className="flex items-center gap-2">
                      <Select
                        value={currentDate.getMonth().toString()}
                        onValueChange={(v) => {
                          const newDate = new Date(currentDate)
                          newDate.setMonth(parseInt(v))
                          setCurrentDate(newDate)
                        }}
                      >
                        <SelectTrigger className="w-[140px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {meses.map((m, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={currentDate.getFullYear().toString()}
                        onValueChange={(v) => {
                          const newDate = new Date(currentDate)
                          newDate.setFullYear(parseInt(v))
                          setCurrentDate(newDate)
                        }}
                      >
                        <SelectTrigger className="w-[100px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {anos.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {listaComprometimento.map((item, idx) => {
                    const isItemNegative =
                      faturamentoMedio > 0 && item.valor > faturamentoMedio * 0.8

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border bg-card shadow-sm transition-all hover:scale-[1.01] gap-4',
                          isItemNegative
                            ? 'border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/20'
                            : '',
                        )}
                      >
                        <div className="font-semibold text-base flex items-center gap-3">
                          {item.nome.includes('Cartão') ? (
                            <CreditCard
                              className={cn(
                                'w-6 h-6',
                                isItemNegative ? 'text-red-500' : 'text-primary',
                              )}
                            />
                          ) : (
                            <Wallet
                              className={cn(
                                'w-6 h-6',
                                isItemNegative ? 'text-red-500' : 'text-primary',
                              )}
                            />
                          )}
                          <span className={isItemNegative ? 'text-red-700 dark:text-red-400' : ''}>
                            {item.nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                          <div
                            className={cn(
                              'font-bold text-xl tracking-tight',
                              isItemNegative ? 'text-red-600 dark:text-red-400' : '',
                            )}
                          >
                            R$ {item.valor.toFixed(2).replace('.', ',')}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 rounded-full"
                            onClick={() => handleVerDetalhes(item.nome)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  {listaComprometimento.length === 0 && !loading && (
                    <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
                      <List className="w-12 h-12 opacity-20" />
                      <p className="text-lg">Nenhum comprometimento projetado para este mês.</p>
                    </div>
                  )}
                  {listaComprometimento.length > 0 && (
                    <div
                      className={cn(
                        'flex items-center justify-between p-6 rounded-2xl shadow-md mt-6 transition-colors',
                        isTotalNegative
                          ? 'bg-red-600 text-white'
                          : 'bg-primary text-primary-foreground',
                      )}
                    >
                      <div className="font-bold text-xl">Total Comprometido</div>
                      <div className="font-bold text-2xl tracking-tight">
                        R$ {totalComprometido.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 border-b bg-muted/30">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                    <div
                      key={d}
                      className="p-2 text-center text-xs font-bold text-muted-foreground uppercase"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {loading ? (
                  <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)]">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="border-b border-r p-2 min-h-[120px] flex flex-col gap-2"
                      >
                        <Skeleton className="w-7 h-7 rounded-full" />
                        <Skeleton className="w-full h-8 rounded-md" />
                        {i % 3 === 0 && <Skeleton className="w-full h-8 rounded-md" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)]">
                    {blanks.map((_, i) => (
                      <div
                        key={`blank-${i}`}
                        className="border-b border-r bg-muted/10 p-2 min-h-[120px]"
                      />
                    ))}
                    {days.map((day, i) => {
                      const isCurrent = isToday(day)
                      const hasItems = projectedItems.some((item) =>
                        isSameDay(parseISO(item.data_vencimento), day),
                      )

                      return (
                        <div
                          key={`day-${i}`}
                          className={cn(
                            'border-b border-r p-2 transition-colors min-h-[120px] flex flex-col',
                            isCurrent && 'bg-primary/5',
                            !isCurrent && 'hover:bg-secondary/20',
                          )}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span
                              className={cn(
                                'text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full',
                                isCurrent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground',
                              )}
                            >
                              {format(day, 'd')}
                            </span>
                          </div>
                          <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                            {renderDayItems(day)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen m-0 p-0 rounded-none overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm">
          <DialogHeader className="px-6 py-6 border-b bg-card shadow-sm">
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <List className="w-8 h-8 text-primary" />
              Detalhes: {selectedGroup}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 px-4 sm:px-8 bg-muted/10">
            <div className="max-w-5xl mx-auto space-y-4 py-8">
              {groupDetails.length > 0 ? (
                groupDetails.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-card p-5 rounded-2xl border shadow-sm gap-4 transition-all hover:scale-[1.01] hover:border-primary/30 hover:shadow-md"
                  >
                    <div>
                      <div className="font-bold text-xl text-foreground mb-1">{item.descricao}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs font-semibold text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          Venc: {format(parseISO(item.data_vencimento), 'dd/MM/yyyy')}
                        </span>
                        {item.parcelamento && (
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                            Parc: {item.parcelamento}
                          </span>
                        )}
                        {item.isFixa && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <Repeat className="w-3.5 h-3.5" /> Conta Fixa
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md',
                            item.status === 'Pago' || item.status === 'Confirmado'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : item.status === 'Vencido'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                          )}
                        >
                          {item.status || 'Pendente'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <div className="font-black text-2xl tracking-tight text-primary">
                        R$ {Number(item.valor).toFixed(2).replace('.', ',')}
                      </div>
                      {!item.isConsolidated && item.original_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full shadow-sm"
                          onClick={() => {
                            openModal(item.original_id, item.isFixa ? 'conta_fixa' : 'despesa')
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-20 flex flex-col items-center bg-card rounded-3xl border border-dashed">
                  <AlertTriangle className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-xl font-medium">Nenhum detalhe encontrado para este grupo.</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 py-6 bg-card border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-auto">
            <div className="flex w-full justify-between items-center max-w-5xl mx-auto">
              <span className="text-xl font-semibold text-muted-foreground">Total do Grupo:</span>
              <span className="text-4xl font-black tracking-tighter text-primary">
                R${' '}
                {groupDetails
                  .reduce((acc, curr) => acc + Number(curr.valor), 0)
                  .toFixed(2)
                  .replace('.', ',')}
              </span>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExpenseFormModal />
    </div>
  )
}
