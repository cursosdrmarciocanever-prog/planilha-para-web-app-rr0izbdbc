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
  isBefore,
  isToday,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function ContasAPagarTab({ despesas, onOpenNew, onEdit }: any) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const expensesByDate = useMemo(() => {
    const map = new Map<string, any[]>()
    despesas.forEach((d: any) => {
      if (!d.data_vencimento) return
      const dateStr = format(parseISO(d.data_vencimento), 'yyyy-MM-dd')
      if (!map.has(dateStr)) map.set(dateStr, [])
      map.get(dateStr)!.push(d)
    })
    return map
  }, [despesas])

  const selectedMonthExpenses = useMemo(() => {
    return despesas
      .filter((d: any) => {
        if (!d.data_vencimento) return false
        const dDate = parseISO(d.data_vencimento)
        return isSameMonth(dDate, currentMonth)
      })
      .sort(
        (a: any, b: any) =>
          parseISO(a.data_vencimento).getTime() - parseISO(b.data_vencimento).getTime(),
      )
  }, [despesas, currentMonth])

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-fade-in-up">
      <Card className="flex-1 rounded-3xl shadow-sm border-border/60 overflow-hidden bg-card min-w-[300px]">
        <div className="p-5 border-b border-border/40 flex justify-between items-center bg-secondary/20">
          <h2 className="text-xl font-bold capitalize text-foreground">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-9 w-9 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-9 w-9 rounded-full"
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
                  'min-h-[120px] p-2 border-r border-b border-border/40 cursor-pointer transition-colors relative hover:bg-secondary/20 group',
                  !isCurrentMonth && 'bg-secondary/10 opacity-40',
                  isSelected && 'ring-2 ring-primary ring-inset bg-primary/5',
                )}
              >
                <div
                  className={cn(
                    'text-[13px] font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1.5 transition-colors',
                    isToday(day) && 'bg-primary text-primary-foreground',
                    !isToday(day) && !isCurrentMonth && 'text-muted-foreground',
                    !isToday(day) &&
                      isCurrentMonth &&
                      'text-foreground group-hover:bg-secondary/50',
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[75px] pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {dayExpenses.map((d) => {
                    const isPaid = d.status === 'Pago'
                    const isOverdue =
                      !isPaid &&
                      isBefore(parseISO(d.data_vencimento), new Date()) &&
                      !isToday(parseISO(d.data_vencimento))

                    return (
                      <div
                        key={d.id}
                        className={cn(
                          'text-[10px] px-2 py-1 rounded-md truncate font-semibold transition-all hover:brightness-95 flex items-center gap-1.5 shadow-sm border',
                          isPaid
                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                            : isOverdue
                              ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
                        )}
                        title={d.descricao}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(d)
                        }}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            isPaid ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-yellow-500',
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

      <Card className="w-full xl:w-[400px] shrink-0 rounded-3xl shadow-sm border-border/60 flex flex-col bg-card overflow-hidden">
        <CardHeader className="p-5 border-b border-border/40 bg-secondary/20 flex-row justify-between items-center space-y-0">
          <CardTitle className="text-lg font-bold text-foreground">Contas do Mês</CardTitle>
          <Button size="sm" onClick={onOpenNew} className="h-9 gap-2 rounded-full px-4 shadow-sm">
            <Plus className="w-4 h-4" /> Nova Conta
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea className="h-[600px] xl:h-auto xl:flex-1">
            {selectedMonthExpenses.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="bg-secondary/50 p-4 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-base font-medium text-foreground">Nenhuma conta agendada</p>
                <p className="text-sm mt-1">Não há vencimentos para o mês selecionado.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 pb-4">
                {selectedMonthExpenses.map((d: any) => {
                  const isPaid = d.status === 'Pago'
                  const isOverdue =
                    !isPaid &&
                    isBefore(parseISO(d.data_vencimento), new Date()) &&
                    !isToday(parseISO(d.data_vencimento))

                  return (
                    <div
                      key={d.id}
                      className="p-5 hover:bg-secondary/10 transition-colors flex justify-between items-center gap-4 cursor-pointer group"
                      onClick={() => onEdit(d)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {d.descricao}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                            {format(parseISO(d.data_vencimento), 'dd/MM')}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm',
                              isPaid
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : isOverdue
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                            )}
                          >
                            {isPaid ? 'Pago' : isOverdue ? 'Vencida' : 'Pendente'}
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
