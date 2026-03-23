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
import { updateSala } from '@/services/taxa-sala'
import { useToast } from '@/hooks/use-toast'
import { Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MetasPorSala({ salas, ocupacoes, totalDespesas, reloadSalas }: any) {
  const { toast } = useToast()

  const custoSalaMes = totalDespesas / Math.max(1, salas.length)

  const salasStats = salas.map((s: any) => {
    const sOcups = ocupacoes.filter((o: any) => o.sala_id === s.id)
    const faturamentoReal = sOcups.reduce(
      (acc: number, o: any) => acc + Number(o.valor_cobrado || 0),
      0,
    )
    let horasReais = 0
    sOcups.forEach((o: any) => {
      const start = new Date(o.horario_inicio).getTime()
      const end = new Date(o.horario_fim).getTime()
      horasReais += Math.max(0, (end - start) / (1000 * 60 * 60))
    })

    const metaFaturamento = Number(s.meta_faturamento || 0)
    const metaHoras = Number(s.meta_horas || 0)

    const percFaturamento = metaFaturamento > 0 ? (faturamentoReal / metaFaturamento) * 100 : 0
    const percHoras = metaHoras > 0 ? (horasReais / metaHoras) * 100 : 0

    const lucro = faturamentoReal - custoSalaMes
    const roi = custoSalaMes > 0 ? (lucro / custoSalaMes) * 100 : 0

    return {
      ...s,
      faturamentoReal,
      horasReais,
      percFaturamento,
      percHoras,
      custoFixo: custoSalaMes,
      lucro,
      roi,
    }
  })

  const handleUpdate = async (id: string, field: string, val: number) => {
    const original = salas.find((s: any) => s.id === id)
    if (original && Number(original[field] || 0) === val) return

    try {
      await updateSala(id, { [field]: val })
      reloadSalas()
      toast({ title: 'Meta atualizada com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao atualizar meta', variant: 'destructive' })
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const totalFaturado = salasStats.reduce((acc: number, s: any) => acc + s.faturamentoReal, 0)
  const totalMeta = salasStats.reduce(
    (acc: number, s: any) => acc + Number(s.meta_faturamento || 0),
    0,
  )
  const percGeral = totalMeta > 0 ? (totalFaturado / totalMeta) * 100 : 0

  const sortedRoi = [...salasStats]
    .filter((s) => s.faturamentoReal > 0 || s.meta_faturamento > 0)
    .sort((a, b) => b.roi - a.roi)
  const bestRoi = sortedRoi.length > 0 ? sortedRoi[0] : null
  const worstRoi = sortedRoi.length > 0 ? sortedRoi[sortedRoi.length - 1] : null

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 bg-card overflow-hidden mt-8">
      <CardHeader className="pb-4 border-b border-border/40 bg-secondary/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> Metas de Faturamento por Sala
        </CardTitle>
        <CardDescription>
          Defina metas e acompanhe o ROI (Retorno sobre Investimento) de cada sala no período
          selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl border border-border bg-background flex flex-col justify-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Atingimento Global
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-foreground">{percGeral.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">de {formatCurrency(totalMeta)}</p>
            </div>
            <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${Math.min(100, percGeral)}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-background flex items-center gap-4 shadow-sm">
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Melhor ROI
              </p>
              <p className="font-bold text-foreground text-sm truncate max-w-[150px]">
                {bestRoi ? bestRoi.nome : 'N/A'}
              </p>
              <p className="text-emerald-600 font-black">
                {bestRoi ? `+${bestRoi.roi.toFixed(1)}%` : '-'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-background flex items-center gap-4 shadow-sm">
            <div className="bg-rose-100 p-3 rounded-full">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Maior Alerta
              </p>
              <p className="font-bold text-foreground text-sm truncate max-w-[150px]">
                {worstRoi ? worstRoi.nome : 'N/A'}
              </p>
              <p className="text-rose-600 font-black">
                {worstRoi ? `${worstRoi.roi > 0 ? '+' : ''}${worstRoi.roi.toFixed(1)}%` : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-border/60 rounded-2xl overflow-x-auto shadow-sm">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 w-[180px]">
                  Sala
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 w-[160px]">
                  Meta Fat. (R$)
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 text-right w-[140px]">
                  Realizado
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 w-[120px]">
                  Meta Horas
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 text-right w-[100px]">
                  Horas Reais
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider h-12 text-right">
                  ROI
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salasStats.map((s: any) => (
                <TableRow key={s.id} className="group hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{s.nome}</TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={s.meta_faturamento || 0}
                      onBlur={(e) => handleUpdate(s.id, 'meta_faturamento', Number(e.target.value))}
                      className="h-9 font-medium bg-transparent border-transparent hover:border-input focus:bg-background transition-all text-primary"
                    />
                  </TableCell>
                  <TableCell className="text-right p-4">
                    <p className="font-bold text-[13px]">{formatCurrency(s.faturamentoReal)}</p>
                    <p
                      className={cn(
                        'text-[10px] font-bold mt-0.5',
                        s.percFaturamento >= 100 ? 'text-emerald-600' : 'text-amber-600',
                      )}
                    >
                      {s.percFaturamento.toFixed(1)}%
                    </p>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      defaultValue={s.meta_horas || 0}
                      onBlur={(e) => handleUpdate(s.id, 'meta_horas', Number(e.target.value))}
                      className="h-9 bg-transparent border-transparent hover:border-input focus:bg-background transition-all"
                    />
                  </TableCell>
                  <TableCell className="text-right p-4">
                    <p className="font-medium text-[13px]">{s.horasReais.toFixed(1)} h</p>
                    <p
                      className={cn(
                        'text-[10px] font-bold mt-0.5',
                        s.percHoras >= 100 ? 'text-emerald-600' : 'text-amber-600',
                      )}
                    >
                      {s.percHoras.toFixed(1)}%
                    </p>
                  </TableCell>
                  <TableCell className="text-right p-4">
                    <span
                      className={cn(
                        'inline-flex px-2 py-1 rounded-md text-[11px] font-bold shadow-sm whitespace-nowrap',
                        s.roi > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                      )}
                    >
                      {s.roi > 0 ? '+' : ''}
                      {s.roi.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
