import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, TrendingUp, Bell, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { Link } from 'react-router-dom'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Button } from '@/components/ui/button'

export function SystemAlerts() {
  const [limite] = useLocalStorage('taxa_limite_custo_hora', 250)
  const [metaOcupacao] = useLocalStorage('taxa_meta_ocupacao', 70)
  const [hiddenAlerts, setHiddenAlerts] = useLocalStorage<Record<string, string>>(
    'hidden_system_alerts',
    {},
  )
  const [alerts, setAlerts] = useState<any[]>([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlerts() {
      try {
        const today = new Date()
        const startCurrent = startOfMonth(today).toISOString()
        const endCurrent = endOfMonth(today).toISOString()

        // Fetch despesas current month
        const { data: despesasCurrent } = await supabase
          .from('despesas')
          .select('valor')
          .gte('created_at', startCurrent)
          .lte('created_at', endCurrent)

        const totalDespesas = (despesasCurrent || []).reduce(
          (acc, d) => acc + Number(d.valor || 0),
          0,
        )

        // Fetch salas for horas
        const { data: salas } = await supabase.from('salas').select('*')
        const salaRef = salas && salas.length > 0 ? salas[0] : null
        const horasMes = salaRef ? Number(salaRef.horas_mes || 220) : 220
        const totalHorasDisponiveis = Math.max(1, salas?.length || 1) * horasMes

        // 1. Alerta Custo Hora
        const custoHora100 = horasMes > 0 ? totalDespesas / horasMes : 0
        const newAlerts = []

        if (custoHora100 > limite) {
          newAlerts.push({
            id: 'custo_hora',
            type: 'danger',
            title: `Taxa de Sala: Custo Hora acima do limite (R$ ${custoHora100.toFixed(2)} > R$ ${limite.toFixed(2)})`,
            link: '/taxa',
          })
        }

        // Fetch ocupacoes current month
        const { data: ocupacoes } = await supabase
          .from('ocupacao_salas')
          .select('horario_inicio, horario_fim')
          .gte('horario_inicio', startCurrent)
          .lte('horario_inicio', endCurrent)

        let horasOcupadas = 0
        ;(ocupacoes || []).forEach((o) => {
          const s = new Date(o.horario_inicio).getTime()
          const e = new Date(o.horario_fim).getTime()
          horasOcupadas += Math.max(0, (e - s) / (1000 * 60 * 60))
        })

        // 2. Alerta Ocupação
        const percOcupacao =
          totalHorasDisponiveis > 0 ? (horasOcupadas / totalHorasDisponiveis) * 100 : 0
        if (percOcupacao < metaOcupacao) {
          newAlerts.push({
            id: 'ocupacao_baixa',
            type: 'warning',
            title: `Ocupação abaixo da meta (${percOcupacao.toFixed(1)}% de ${metaOcupacao}%)`,
            link: '/taxa',
          })
        }

        // 3. Alerta Despesas (avg last 3 months)
        const start3M = startOfMonth(subMonths(today, 3)).toISOString()
        const endLastM = endOfMonth(subMonths(today, 1)).toISOString()
        const { data: despesas3M } = await supabase
          .from('despesas')
          .select('valor')
          .gte('created_at', start3M)
          .lte('created_at', endLastM)

        const total3M = (despesas3M || []).reduce((acc, d) => acc + Number(d.valor || 0), 0)
        const avg3M = total3M / 3

        if (avg3M > 0 && totalDespesas > avg3M * 1.1) {
          const percAumento = ((totalDespesas - avg3M) / avg3M) * 100
          newAlerts.push({
            id: 'despesas_alta',
            type: 'warning',
            title: `Despesas: Aumento de ${percAumento.toFixed(1)}% em relação à média dos últimos 3 meses`,
            link: '/despesas',
          })
        }

        setAlerts(newAlerts)
      } catch (e) {
        console.error('Failed to load system alerts', e)
      } finally {
        setLoading(false)
      }
    }
    loadAlerts()
  }, [limite, metaOcupacao])

  const todayStr = new Date().toISOString().split('T')[0]
  const activeAlerts = alerts.filter((a) => hiddenAlerts[a.id] !== todayStr)

  const handleDismiss = (id: string) => {
    setHiddenAlerts({ ...hiddenAlerts, [id]: todayStr })
  }

  if (loading) return null

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 mb-8 shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="font-medium text-sm">
          ✓ Sistema operando normalmente. Todos os indicadores estão dentro dos parâmetros.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-sm mb-8 overflow-hidden animate-fade-in-down">
      <div
        className="p-4 bg-secondary/20 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
              {activeAlerts.length}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground leading-tight">Alertas do Sistema</h3>
            <p className="text-xs text-muted-foreground">
              {activeAlerts.length} notificação(ões) requerem sua atenção
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/50 shadow-sm border border-border/50"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="p-4 border-t border-border/50 flex flex-col gap-3 bg-background/50">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border shadow-sm ${alert.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div
                  className={`p-2 rounded-full shrink-0 ${alert.type === 'danger' ? 'bg-rose-100' : 'bg-amber-100'}`}
                >
                  <AlertCircle
                    className={`w-4 h-4 ${alert.type === 'danger' ? 'text-rose-600' : 'text-amber-600'}`}
                  />
                </div>
                <span className="font-semibold text-sm">{alert.title}</span>
              </div>
              <div className="flex items-center gap-2 pl-11 sm:pl-0">
                <Link to={alert.link}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-white/60 hover:bg-white shadow-sm border-0 font-bold"
                  >
                    Ver detalhes
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDismiss(alert.id)
                  }}
                >
                  Ocultar hoje
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
