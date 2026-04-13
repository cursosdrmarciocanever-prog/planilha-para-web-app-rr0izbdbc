import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, Activity, Percent } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export default function Simulador({
  baseTotalDespesas,
  sala,
  baseSalasCount,
  baseTurnos,
  baseSemanas,
  onApply,
}: any) {
  const { toast } = useToast()

  const [despesas, setDespesas] = useState(baseTotalDespesas)
  const [horas, setHoras] = useState(Number(sala.horas_mes || 220))
  const [dias, setDias] = useState(Number(sala.dias_mes || 22))
  const [salas, setSalas] = useState(Math.max(1, baseSalasCount))
  const [turnos, setTurnos] = useState(Number(baseTurnos) || 2)
  const [semanas, setSemanas] = useState(Number(baseSemanas) || 4)
  const [reducao, setReducao] = useState(0)

  useEffect(() => {
    setDespesas(baseTotalDespesas)
    setHoras(Number(sala.horas_mes || 220))
    setDias(Number(sala.dias_mes || 22))
    setSalas(Math.max(1, baseSalasCount))
    setTurnos(Number(baseTurnos) || 2)
    setSemanas(Number(baseSemanas) || 4)
  }, [baseTotalDespesas, sala, baseSalasCount, baseTurnos, baseSemanas])

  const despesasEfetivas = despesas * (1 - reducao / 100)

  const sOpFixasDia = despesasEfetivas / dias
  const sCustoSalaMes = despesasEfetivas / salas
  const sCustoPorTurnoMes = sCustoSalaMes / turnos
  const sTurnoSemanal = sCustoPorTurnoMes / semanas
  const sSalaDia = despesasEfetivas / dias
  const sCustoHora100 = despesasEfetivas / horas
  const sCustoHora50 = sCustoHora100 / 0.5
  const sCustoHora20 = sCustoHora100 / 0.2

  // Base
  const bOpFixasDia = baseTotalDespesas / Number(sala.dias_mes || 22)
  const bCustoSalaMes = baseTotalDespesas / Math.max(1, baseSalasCount)
  const bCustoPorTurnoMes = bCustoSalaMes / (Number(baseTurnos) || 2)
  const bTurnoSemanal = bCustoPorTurnoMes / (Number(baseSemanas) || 4)
  const bSalaDia = baseTotalDespesas / Number(sala.dias_mes || 22)
  const bCustoHora100 = baseTotalDespesas / Number(sala.horas_mes || 220)
  const bCustoHora50 = bCustoHora100 / 0.5
  const bCustoHora20 = bCustoHora100 / 0.2

  const formatC = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const handleApply = () => {
    if (
      confirm(
        'Deseja aplicar os valores de Turnos e Semanas simulados para os dados reais?\n(Nota: Ajustes de despesas, redução e salas precisam ser alterados manualmente nas respectivas tabelas)',
      )
    ) {
      onApply({ turnos: String(turnos), semanas: String(semanas) })
      toast({ title: 'Cenário aplicado', description: 'Turnos e semanas atualizados com sucesso.' })
    }
  }

  const comparisons = [
    { name: 'Custos Totais', base: baseTotalDespesas, sim: despesasEfetivas },
    { name: 'Operacionais/Dia', base: bOpFixasDia, sim: sOpFixasDia },
    { name: 'Custo Sala/Mês', base: bCustoSalaMes, sim: sCustoSalaMes },
    { name: 'Custo por Turno/Mês', base: bCustoPorTurnoMes, sim: sCustoPorTurnoMes },
    { name: 'Turno Semanal', base: bTurnoSemanal, sim: sTurnoSemanal },
    { name: 'Sala Dia', base: bSalaDia, sim: sSalaDia },
    { name: 'Custo Hora 100%', base: bCustoHora100, sim: sCustoHora100, highlight: true },
    { name: 'Custo Hora 50%', base: bCustoHora50, sim: sCustoHora50 },
    { name: 'Custo Hora 20%', base: bCustoHora20, sim: sCustoHora20 },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up">
      <div className="xl:col-span-4 flex flex-col gap-6">
        <Card className="shadow-sm rounded-3xl border-border/60 bg-card overflow-hidden">
          <CardHeader className="bg-secondary/10 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" /> Parâmetros
            </CardTitle>
            <CardDescription>Ajuste as variáveis para testar impacto financeiro.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-muted-foreground uppercase text-[11px] font-bold tracking-widest">
                Total Despesas Fixas (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={despesas}
                onChange={(e) => setDespesas(Number(e.target.value))}
                className="h-10 text-lg font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[11px] font-bold tracking-widest">
                  Horas/mês
                </Label>
                <Input
                  type="number"
                  value={horas}
                  onChange={(e) => setHoras(Number(e.target.value))}
                  className="h-10 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[11px] font-bold tracking-widest">
                  Dias/mês
                </Label>
                <Input
                  type="number"
                  value={dias}
                  onChange={(e) => setDias(Number(e.target.value))}
                  className="h-10 font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[11px] font-bold tracking-widest">
                  Salas
                </Label>
                <Input
                  type="number"
                  value={salas}
                  onChange={(e) => setSalas(Number(e.target.value))}
                  className="h-10 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[11px] font-bold tracking-widest">
                  Turnos
                </Label>
                <Input
                  type="number"
                  value={turnos}
                  onChange={(e) => setTurnos(Number(e.target.value))}
                  className="h-10 font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[11px] font-bold tracking-widest">
                  Semanas
                </Label>
                <Input
                  type="number"
                  value={semanas}
                  onChange={(e) => setSemanas(Number(e.target.value))}
                  className="h-10 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[11px] font-bold tracking-widest flex items-center gap-1">
                  Redução <Percent className="w-3 h-3" />
                </Label>
                <Input
                  type="number"
                  value={reducao}
                  onChange={(e) => setReducao(Number(e.target.value))}
                  className="h-10 font-medium border-emerald-500/50 focus-visible:ring-emerald-500 text-emerald-600"
                />
              </div>
            </div>

            <Button
              onClick={handleApply}
              className="w-full mt-4 rounded-full h-12 shadow-md hover:shadow-lg transition-all"
            >
              <Check className="w-4 h-4 mr-2" /> Aplicar Cenário
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {comparisons.slice(0, 3).map((c, i) => (
            <Card
              key={i}
              className="shadow-sm rounded-2xl border-border/60 text-center overflow-hidden"
            >
              <CardHeader className="py-3.5 bg-secondary/10 border-b border-border/40">
                <CardTitle className="text-[11px] text-muted-foreground uppercase tracking-widest">
                  {c.name} Simulado
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-2xl font-black text-foreground">{formatC(c.sim)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-sm rounded-3xl border-border/60 bg-card overflow-hidden flex-1">
          <CardHeader className="border-b border-border/40 bg-secondary/10">
            <CardTitle className="text-lg">Comparativo de Indicadores</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/95 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider h-11">
                    Indicador
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider h-11 w-[130px]">
                    Atual
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider h-11 w-[130px]">
                    Simulado
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider h-11 w-[150px]">
                    Variação
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((c, i) => {
                  const diff = c.sim - c.base
                  const perc = c.base > 0 ? (diff / c.base) * 100 : 0
                  const isPositive = diff > 0
                  const isNegative = diff < 0
                  return (
                    <TableRow
                      key={i}
                      className={cn(
                        'hover:bg-secondary/20 transition-colors',
                        c.highlight && 'bg-primary/[0.03]',
                      )}
                    >
                      <TableCell
                        className={cn(
                          'font-medium py-3 text-[13px]',
                          c.highlight && 'text-primary font-bold',
                        )}
                      >
                        {c.name}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground py-3 text-[13px]">
                        {formatC(c.base)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-bold py-3 text-[13px]',
                          c.highlight && 'text-primary',
                        )}
                      >
                        {formatC(c.sim)}
                      </TableCell>
                      <TableCell className="text-right py-3 pr-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm whitespace-nowrap',
                            isNegative
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : isPositive
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-secondary text-secondary-foreground border border-border',
                          )}
                        >
                          {isPositive ? '+' : ''}
                          {perc.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
