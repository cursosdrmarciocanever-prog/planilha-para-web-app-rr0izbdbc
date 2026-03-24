import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, CalendarRange, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ContasAPagarTabProps {
  contas: any[]
  onOpenNew: () => void
  onEdit: (conta: any) => void
}

export function ContasAPagarTab({ contas, onOpenNew, onEdit }: ContasAPagarTabProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const expensesByDate = useMemo(() => {
    const map = new Map<string, any[]>()
    contas.forEach((d: any) => {
      if (!d.data_vencimento) return
      const dateStr = format(parseISO(d.data_vencimento), 'yyyy-MM-dd')
      if (!map.has(dateStr)) map.set(dateStr, [])
      map.get(dateStr)!.push(d)
    })
    return map
  }, [contas])

  const selectedMonthExpenses = useMemo(() => {
    return contas
      .filter((d: any) => {
        if (!d.data_vencimento) return false
        const dDate = parseISO(d.data_vencimento)
        return isSameMonth(dDate, currentMonth)
      })
      .sort(
        (a: any, b: any) =>
          parseISO(a.data_vencimento).getTime() - parseISO(b.data_vencimento).getTime(),
      )
  }, [contas, currentMonth])

  const getStatusInfo = (d: any) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dDate = parseISO(d.data_vencimento)
    dDate.setHours(0, 0, 0, 0)

    const diffTime = dDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const isPaid = d.status === 'Pago'
    const isOverdue = d.status === 'Vencido' || (!isPaid && diffDays < 0)
    const isSoon = !isPaid && !isOverdue && diffDays >= 0 && diffDays <= 3
    const isPending = !isPaid && !isOverdue && !isSoon

    return { isPaid, isOverdue, isSoon, isPending, diffDays }
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const mes = currentMonth.getMonth() + 1
      const ano = currentMonth.getFullYear()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gerar_relatorio_contas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ mes, ano }),
        },
      )

      if (!response.ok) {
        throw new Error('Falha ao gerar o relatório')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Relatorio_Contas_${mes.toString().padStart(2, '0')}_${ano}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({ title: 'Sucesso', description: 'Relatório gerado com sucesso.' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro', description: 'Falha ao gerar relatório.', variant: 'destructive' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-fade-in-up">
      {/* Calendário Visual */}
      <Card className="flex-1 rounded-3xl shadow-sm border-border/60 overflow-hidden bg-card min-w-[300px]">
        <div className="p-5 border-b border-border/40 flex justify-between items-center bg-secondary/20">
          <h2 className="text-xl font-bold capitalize text-foreground flex items-center gap-2">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(startOfMonth(new Date()))}
              className="h-9 px-4 rounded-full mr-2 shadow-sm"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-9 w-9 rounded-full shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-9 w-9 rounded-full shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border/40 bg-secondary/5">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayExpenses = expensesByDate.get(dateStr) || []
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, monthStart)

            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'min-h-[120px] p-1.5 border-r border-b border-border/40 cursor-pointer transition-colors relative hover:bg-secondary/20 group flex flex-col',
                  !isCurrentMonth && 'bg-secondary/10 opacity-40',
                  isSelected && 'ring-2 ring-primary ring-inset bg-primary/5',
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div
                    className={cn(
                      'text-[13px] font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                      isToday(day) && 'bg-primary text-primary-foreground',
                      !isToday(day) && !isCurrentMonth && 'text-muted-foreground',
                      !isToday(day) &&
                        isCurrentMonth &&
                        'text-foreground group-hover:bg-secondary/50',
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  {dayExpenses.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium pr-1 mt-1">
                      {dayExpenses.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {dayExpenses.map((d) => {
                    const { isPaid, isOverdue, isSoon } = getStatusInfo(d)

                    return (
                      <div
                        key={d.id}
                        className={cn(
                          'text-[11px] px-1.5 py-1 rounded-md truncate font-medium transition-all hover:brightness-95 flex items-center gap-1.5 shadow-sm border',
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
                            : isOverdue
                              ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800'
                              : isSoon
                                ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
                        )}
                        title={`${d.descricao} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor)}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(d)
                        }}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            isPaid
                              ? 'bg-emerald-500'
                              : isOverdue
                                ? 'bg-rose-500'
                                : isSoon
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400',
                          )}
                        />
                        {d.descricao}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Painel Lateral */}
      <Card className="w-full xl:w-[400px] shrink-0 rounded-3xl shadow-sm border-border/60 flex flex-col bg-card overflow-hidden">
        <CardHeader className="p-5 border-b border-border/40 bg-secondary/20 flex-row justify-between items-center space-y-0">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">Contas do Mês</CardTitle>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="h-9 gap-1 sm:gap-2 rounded-full px-3 sm:px-4 shadow-sm"
              title="Gerar Relatório PDF"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Relatório PDF</span>
            </Button>
            <Button
              size="sm"
              onClick={onOpenNew}
              className="h-9 gap-1 sm:gap-2 rounded-full px-3 sm:px-4 shadow-sm"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nova Conta</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea className="h-[600px] xl:h-auto xl:flex-1">
            {selectedMonthExpenses.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="bg-secondary/50 p-4 rounded-full mb-4">
                  <CalendarRange className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-base font-medium text-foreground">Nenhuma conta no mês</p>
                <p className="text-sm mt-1">Não há vencimentos agendados para este período.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 pb-4">
                {selectedMonthExpenses.map((d: any) => {
                  const { isPaid, isOverdue, isSoon } = getStatusInfo(d)

                  return (
                    <div
                      key={d.id}
                      className="p-5 hover:bg-secondary/10 transition-colors flex justify-between items-center gap-4 cursor-pointer group"
                      onClick={() => onEdit(d)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full shrink-0',
                              isPaid
                                ? 'bg-emerald-500'
                                : isOverdue
                                  ? 'bg-rose-500'
                                  : isSoon
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400',
                            )}
                          />
                          {d.descricao}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 pl-4">
                          <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                            Venc: {format(parseISO(d.data_vencimento), 'dd/MM')}
                          </span>
                          {d.frequencia && d.frequencia !== 'Única' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-medium border border-border/50 text-muted-foreground">
                              {d.frequencia}
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm',
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : isOverdue
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                  : isSoon
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                            )}
                          >
                            {isPaid
                              ? 'Paga'
                              : isOverdue
                                ? 'Vencida'
                                : isSoon
                                  ? 'Próxima'
                                  : 'Pendente'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            'text-[15px] font-bold',
                            isPaid
                              ? 'text-muted-foreground line-through opacity-60'
                              : 'text-foreground',
                          )}
                        >
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(d.valor)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
