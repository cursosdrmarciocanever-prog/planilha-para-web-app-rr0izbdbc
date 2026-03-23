import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Stethoscope,
  Loader2,
  Calendar,
} from 'lucide-react'
import { ProcedimentoTaxa } from '@/types/taxa-sala'
import {
  getProcedimentosTaxa,
  addProcedimentoTaxa,
  updateProcedimentoTaxa,
  deleteProcedimentoTaxa,
  getOcupacoes,
} from '@/services/taxa-sala'
import { startOfMonth, endOfMonth } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function AnaliseProcedimentos({ custoHora100 }: { custoHora100: number }) {
  const [procedimentos, setProcedimentos] = useState<ProcedimentoTaxa[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Agenda stats
  const [agendaStats, setAgendaStats] = useState({ qtd: 0, receita: 0 })
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const data = await getProcedimentosTaxa()
      setProcedimentos(data)

      // Load agenda stats for current month
      const start = startOfMonth(new Date()).toISOString()
      const end = endOfMonth(new Date()).toISOString()
      const ocupacoes = await getOcupacoes(start, end)

      const receitaTotal = ocupacoes.reduce((acc, o) => acc + Number(o.valor_cobrado || 0), 0)
      setAgendaStats({ qtd: ocupacoes.length, receita: receitaTotal })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddRow = async () => {
    try {
      const novo = await addProcedimentoTaxa({
        nome: 'Novo Procedimento',
        duracao_minutos: 30,
        valor_cobrado: 0,
      })
      setProcedimentos([...procedimentos, novo])
    } catch (e) {
      toast({ title: 'Erro ao adicionar procedimento', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este procedimento?')) return
    try {
      await deleteProcedimentoTaxa(id)
      setProcedimentos(procedimentos.filter((p) => p.id !== id))
    } catch (e) {
      toast({ title: 'Erro ao excluir procedimento', variant: 'destructive' })
    }
  }

  const handleUpdate = async (id: string, field: keyof ProcedimentoTaxa, value: any) => {
    const original = procedimentos.find((p) => p.id === id)
    if (!original || original[field] === value) return

    setSavingId(id)
    try {
      await updateProcedimentoTaxa(id, { [field]: value })
      setProcedimentos(procedimentos.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    } finally {
      setSavingId(null)
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  // Calcs
  const procedsCalculated = useMemo(() => {
    return procedimentos.map((p) => {
      const custo = (p.duracao_minutos / 60) * custoHora100
      const lucro = p.valor_cobrado - custo
      const margem = p.valor_cobrado > 0 ? (lucro / p.valor_cobrado) * 100 : 0
      return { ...p, custo, lucro, margem }
    })
  }, [procedimentos, custoHora100])

  const stats = useMemo(() => {
    if (procedsCalculated.length === 0) return null

    const valid = procedsCalculated.filter((p) => p.valor_cobrado > 0)
    if (valid.length === 0) return null

    const sortedByMargem = [...valid].sort((a, b) => b.margem - a.margem)
    const max = sortedByMargem[0]
    const min = sortedByMargem[sortedByMargem.length - 1]
    const avgMargem = valid.reduce((acc, p) => acc + p.margem, 0) / valid.length

    return { max, min, avgMargem }
  }, [procedsCalculated])

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
      </div>
    )
  }

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 bg-card overflow-hidden mt-8">
      <CardHeader className="pb-4 border-b border-border/40 bg-secondary/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" /> Análise de Lucro por Procedimento
          </CardTitle>
          <CardDescription>
            Calcule a lucratividade de cada procedimento baseado no Custo Hora da clínica.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-primary/5 text-primary px-4 py-2 rounded-2xl border border-primary/20">
          <Calendar className="w-5 h-5 opacity-70" />
          <div className="text-sm">
            <p className="font-semibold leading-tight">Este mês: {agendaStats.qtd} procedimentos</p>
            <p className="text-xs opacity-80">
              Receita gerada: {formatCurrency(agendaStats.receita)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-8">
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-border bg-background flex items-center gap-4 shadow-sm">
              <div className="bg-emerald-100 p-2.5 rounded-full">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Mais Lucrativo
                </p>
                <p className="font-bold text-foreground text-sm truncate max-w-[150px]">
                  {stats.max.nome}
                </p>
                <p className="text-emerald-600 font-black">{stats.max.margem.toFixed(1)}% margem</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background flex items-center gap-4 shadow-sm">
              <div className="bg-rose-100 p-2.5 rounded-full">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Menos Lucrativo
                </p>
                <p className="font-bold text-foreground text-sm truncate max-w-[150px]">
                  {stats.min.nome}
                </p>
                <p className="text-rose-600 font-black">{stats.min.margem.toFixed(1)}% margem</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background flex items-center gap-4 shadow-sm">
              <div className="bg-primary/10 p-2.5 rounded-full">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Margem Média
                </p>
                <p className="font-bold text-foreground text-sm truncate">Todos procedimentos</p>
                <p className="text-primary font-black">{stats.avgMargem.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="border border-border/60 rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 w-[30%]">
                  Procedimento
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 w-[15%]">
                  Duração (min)
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 w-[15%]">
                  Valor (R$)
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 text-right">
                  Custo
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 text-right">
                  Lucro
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 text-right">
                  Margem
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedsCalculated.map((p) => (
                <TableRow key={p.id} className="group hover:bg-secondary/20 transition-colors">
                  <TableCell className="p-2">
                    <Input
                      defaultValue={p.nome}
                      onBlur={(e) => handleUpdate(p.id, 'nome', e.target.value)}
                      className={cn(
                        'h-9 font-medium bg-transparent border-transparent hover:border-input focus:bg-background transition-all',
                        savingId === p.id && 'opacity-50',
                      )}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      defaultValue={p.duracao_minutos}
                      onBlur={(e) => handleUpdate(p.id, 'duracao_minutos', Number(e.target.value))}
                      className="h-9 bg-transparent border-transparent hover:border-input focus:bg-background transition-all"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={p.valor_cobrado}
                      onBlur={(e) => handleUpdate(p.id, 'valor_cobrado', Number(e.target.value))}
                      className="h-9 bg-transparent border-transparent hover:border-input focus:bg-background transition-all text-primary font-medium"
                    />
                  </TableCell>
                  <TableCell className="p-4 text-right font-mono text-[13px] text-muted-foreground bg-secondary/5">
                    {formatCurrency(p.custo)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'p-4 text-right font-mono text-[13px] font-semibold bg-secondary/5',
                      p.lucro >= 0 ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {formatCurrency(p.lucro)}
                  </TableCell>
                  <TableCell className="p-4 text-right bg-secondary/5">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm whitespace-nowrap',
                        p.margem >= 40
                          ? 'bg-emerald-100 text-emerald-700'
                          : p.margem >= 20
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700',
                      )}
                    >
                      {p.margem.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-3 border-t border-border/40 bg-secondary/10 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddRow}
              className="rounded-full text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Adicionar Procedimento
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
