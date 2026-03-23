import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, CheckCircle2, AlertCircle } from 'lucide-react'

export function BreakEvenProjection({ totalDespesas }: { totalDespesas: number }) {
  const [ticketMedio, setTicketMedio] = useState<string>('350')
  const [diasTrabalhados, setDiasTrabalhados] = useState<string>('22')

  const ticket = parseFloat(ticketMedio) || 0
  const dias = parseInt(diasTrabalhados) || 1

  const consultasMes = ticket > 0 ? Math.ceil(totalDespesas / ticket) : 0
  const consultasDia = Math.ceil(consultasMes / dias)

  // Meta factível - exemplo: menos ou igual a 10 por dia é verde, mais é vermelho
  const isPlausible = consultasDia <= 10

  return (
    <Card className="h-full border-primary/20 bg-primary/5 shadow-sm flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <Target className="w-5 h-5" />
          Projeção de Break-even
        </CardTitle>
        <CardDescription className="text-xs text-primary/80">
          Ponto de equilíbrio para cobrir custos de{' '}
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            totalDespesas,
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-primary/90">Ticket Médio (R$)</Label>
            <Input
              type="number"
              value={ticketMedio}
              onChange={(e) => setTicketMedio(e.target.value)}
              className="bg-background/80 border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-primary/90">Dias/Mês</Label>
            <Input
              type="number"
              value={diasTrabalhados}
              onChange={(e) => setDiasTrabalhados(e.target.value)}
              className="bg-background/80 border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col p-4 bg-background/80 rounded-xl border border-primary/10 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Mínimo Mensal
            </span>
            <span className="text-4xl font-bold text-foreground">
              {consultasMes}{' '}
              <span className="text-sm font-medium text-muted-foreground">consultas/mês</span>
            </span>
          </div>

          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isPlausible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}
          >
            <div className="flex items-center gap-2">
              {isPlausible ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-bold uppercase tracking-wider">Meta Diária</span>
            </div>
            <span className="text-xl font-bold">{consultasDia} / dia</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
