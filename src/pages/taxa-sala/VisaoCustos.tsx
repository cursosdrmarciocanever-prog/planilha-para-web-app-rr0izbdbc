import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Info, PieChart } from 'lucide-react'

export function VisaoCustos({
  valores,
  salas,
  selectedSalaId,
  setSelectedSalaId,
  turnos,
  setTurnos,
  semanas,
  setSemanas,
}: any) {
  const totalDespesas = valores.reduce((acc: number, v: any) => acc + (Number(v.valor) || 0), 0)

  const sala = salas.find((s: any) => s.id === selectedSalaId) || salas[0] || {}
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
  const custoHora100 = totalDespesas / horasMes
  const custoHora50 = custoHora100 / 0.5
  const custoHora20 = custoHora100 / 0.2

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const cards = [
    { title: 'CUSTOS TOTAIS', value: totalDespesas },
    { title: 'OPERACIONAIS FIXAS/DIA', value: opFixasDia },
    { title: 'CUSTO SALA/MÊS', value: custoSalaMes },
    { title: 'CUSTO POR TURNO/MÊS', value: custoPorTurnoMes },
    { title: 'TURNO SEMANAL', value: turnoSemanal },
    { title: 'SALA DIA', value: salaDia },
    { title: 'CUSTO HORA OCUP. 100%', value: custoHora100, highlight: true },
    { title: 'CUSTO HORA OCUP. 50%', value: custoHora50 },
    { title: 'CUSTO HORA OCUP. 20%', value: custoHora20 },
  ]

  const totalHorasDisponiveis = salas.reduce(
    (acc: number, s: any) => acc + Number(s.horas_mes || 220),
    0,
  )
  const totalDiasDisponiveis = salas.reduce(
    (acc: number, s: any) => acc + Number(s.dias_mes || 22),
    0,
  )

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 bg-card flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-6 border-b border-border/40 bg-secondary/10">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Visão de Custos
            </CardTitle>
            <CardDescription className="text-sm">
              Indicadores calculados em tempo real (Método GM Metrics).
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40 space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Sala Referência
              </Label>
              <Select value={selectedSalaId} onValueChange={setSelectedSalaId}>
                <SelectTrigger className="h-9 text-sm bg-background border-border/50 shadow-sm rounded-xl">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {salas.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-20 space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Turnos
              </Label>
              <Input
                type="number"
                min="1"
                value={turnos}
                onChange={(e) => setTurnos(e.target.value)}
                className="h-9 text-sm bg-background border-border/50 shadow-sm rounded-xl"
              />
            </div>
            <div className="w-20 space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Semanas
              </Label>
              <Input
                type="number"
                min="1"
                value={semanas}
                onChange={(e) => setSemanas(e.target.value)}
                className="h-9 text-sm bg-background border-border/50 shadow-sm rounded-xl"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-[120px]
              ${
                c.highlight
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03] transform z-10'
                  : 'bg-background border-border/60 shadow-sm hover:border-primary/30 hover:shadow-md'
              }`}
            >
              <h4
                className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${c.highlight ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}
              >
                {c.title}
              </h4>
              <div className="text-[26px] font-black tracking-tighter mt-auto">
                {formatCurrency(c.value)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-secondary/30 rounded-3xl p-6 border border-border/40 mt-auto">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
            <Info className="w-4 h-4" /> Resumo de Capacidade da Clínica
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border/60">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Salas Disponíveis
              </p>
              <p className="text-2xl font-black text-foreground">{numSalas}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Horas Totais
              </p>
              <p className="text-2xl font-black text-foreground">{totalHorasDisponiveis}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Dias Totais
              </p>
              <p className="text-2xl font-black text-foreground">{totalDiasDisponiveis}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
