import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getOcupacoes } from '@/services/taxa-sala'
import { CheckCircle2, AlertTriangle, XCircle, Settings2, Target, Percent } from 'lucide-react'
import { startOfMonth, endOfMonth } from 'date-fns'

export function AlertasEficiencia({ totalDespesas, custoHora100, totalSalas, horasMesBase }: any) {
  const [limite, setLimite] = useLocalStorage('taxa_limite_custo_hora', 250)
  const [meta, setMeta] = useLocalStorage('taxa_meta_ocupacao', 70)
  const [ticket, setTicket] = useLocalStorage('taxa_ticket_medio', 350)
  const [ocupacaoAtualHoras, setOcupacaoAtualHoras] = useState(0)

  useEffect(() => {
    async function loadCurrentOcupacao() {
      try {
        const start = startOfMonth(new Date()).toISOString()
        const end = endOfMonth(new Date()).toISOString()
        const ocupacoes = await getOcupacoes(start, end)

        let totalHoras = 0
        ocupacoes.forEach((o) => {
          const s = new Date(o.horario_inicio).getTime()
          const e = new Date(o.horario_fim).getTime()
          const diff = Math.max(0, (e - s) / (1000 * 60 * 60))
          totalHoras += diff
        })
        setOcupacaoAtualHoras(totalHoras)
      } catch (e) {
        console.error('Erro ao carregar ocupação atual', e)
      }
    }
    loadCurrentOcupacao()
  }, [])

  // Alerta 1: Custo Hora
  let statusCusto = 'success'
  let iconCusto = <CheckCircle2 className="w-8 h-8 text-emerald-500" />
  let msgCusto = 'Custo Hora dentro do limite'
  let colorCusto = 'bg-emerald-50 border-emerald-200 text-emerald-800'

  if (custoHora100 > limite * 1.2) {
    statusCusto = 'danger'
    iconCusto = <XCircle className="w-8 h-8 text-rose-500" />
    msgCusto = 'Custo Hora acima do limite! Revise despesas.'
    colorCusto = 'bg-rose-50 border-rose-200 text-rose-800'
  } else if (custoHora100 > limite) {
    statusCusto = 'warning'
    iconCusto = <AlertTriangle className="w-8 h-8 text-amber-500" />
    msgCusto = 'Custo Hora próximo ou levemente acima do limite.'
    colorCusto = 'bg-amber-50 border-amber-200 text-amber-800'
  }

  // Alerta 2: Ocupação Necessária
  const horasNecessarias = ticket > 0 ? totalDespesas / ticket : 0
  const totalHorasDisponiveis = Math.max(1, totalSalas) * horasMesBase
  const percNecessario =
    totalHorasDisponiveis > 0 ? (horasNecessarias / totalHorasDisponiveis) * 100 : 0

  // Alerta 3: Resumo Status
  const percAtual =
    totalHorasDisponiveis > 0 ? (ocupacaoAtualHoras / totalHorasDisponiveis) * 100 : 0
  const atingiuMeta = percAtual >= meta

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 bg-card overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40 bg-secondary/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> Alertas de Eficiência
        </CardTitle>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
            <Label className="text-muted-foreground whitespace-nowrap text-xs">
              Limite Custo/h:
            </Label>
            <span className="text-muted-foreground">R$</span>
            <Input
              type="number"
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="w-16 h-7 px-1 py-0 text-sm border-none shadow-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
            <Label className="text-muted-foreground whitespace-nowrap text-xs">Meta Ocup.:</Label>
            <Input
              type="number"
              value={meta}
              onChange={(e) => setMeta(Number(e.target.value))}
              className="w-12 h-7 px-1 py-0 text-sm border-none shadow-none bg-transparent text-right"
            />
            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
            <Label className="text-muted-foreground whitespace-nowrap text-xs">Ticket Médio:</Label>
            <span className="text-muted-foreground">R$</span>
            <Input
              type="number"
              value={ticket}
              onChange={(e) => setTicket(Number(e.target.value))}
              className="w-16 h-7 px-1 py-0 text-sm border-none shadow-none bg-transparent"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Custo Hora Status */}
        <div
          className={`p-5 rounded-2xl border flex items-center gap-4 ${colorCusto} transition-colors`}
        >
          <div className="shrink-0 bg-background/50 p-2 rounded-xl backdrop-blur-sm">
            {iconCusto}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              Status do Custo
            </p>
            <p className="font-semibold text-sm leading-tight">{msgCusto}</p>
            <p className="text-lg font-black mt-1">
              {formatCurrency(custoHora100)}{' '}
              <span className="text-xs font-normal opacity-70">/ hora</span>
            </p>
          </div>
        </div>

        {/* Card 2: Ocupação Necessária */}
        <div className="p-5 rounded-2xl border border-border/60 bg-secondary/20 flex flex-col justify-center">
          <div className="flex items-start gap-3">
            <div className="shrink-0 bg-primary/10 p-2 rounded-xl text-primary">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Ocupação Necessária
              </p>
              <p className="text-sm text-foreground/80 leading-tight">
                Para cobrir os custos com ticket de {formatCurrency(ticket)}, você precisa de:
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-foreground">
                  {horasNecessarias.toFixed(0)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">horas/mês</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary ml-1">
                  {percNecessario.toFixed(1)}% ocup.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Resumo Status */}
        <div className="p-5 rounded-2xl border border-border/60 bg-background shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Eficiência Operacional
              </p>
              <p className="text-2xl font-black text-foreground mt-1">{percAtual.toFixed(1)}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Meta: {meta}%</p>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${atingiuMeta ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary text-muted-foreground'}`}
              >
                {atingiuMeta ? 'Meta Atingida' : 'Abaixo da Meta'}
              </span>
            </div>
          </div>
          <Progress
            value={percAtual}
            max={100}
            className="h-2.5 mt-2 bg-secondary"
            indicatorColor={atingiuMeta ? 'bg-emerald-500' : 'bg-primary'}
          />
          <p className="text-[11px] text-muted-foreground mt-2 text-right">
            {ocupacaoAtualHoras.toFixed(1)} de {totalHorasDisponiveis} horas disponíveis ocupadas
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
