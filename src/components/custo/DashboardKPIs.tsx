import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Funcionario } from '@/hooks/use-funcionarios'
import { TrendingUp, AlertTriangle, Users, DollarSign } from 'lucide-react'

export function DashboardKPIs({ funcionarios }: { funcionarios: Funcionario[] }) {
  const metrics = useMemo(() => {
    let totalCusto = 0
    let totalReceita = 0
    let totalHoras = 0

    const bySetor: Record<string, { setor: string; custo: number; receita: number }> = {}

    funcionarios.forEach((f) => {
      const custo =
        (f.salario_base || 0) * (1 + (f.encargos_percentual || 0) / 100) +
        (f.beneficios_mensais || 0)
      totalCusto += custo
      totalReceita += f.receita_gerada || 0
      totalHoras += f.horas_mensais || 0

      const s = f.setor || 'Geral'
      if (!bySetor[s]) bySetor[s] = { setor: s, custo: 0, receita: 0 }
      bySetor[s].custo += custo
      bySetor[s].receita += f.receita_gerada || 0
    })

    return {
      totalCusto,
      totalReceita,
      custoHora: totalHoras ? totalCusto / totalHoras : 0,
      percentualCusto: totalReceita ? (totalCusto / totalReceita) * 100 : 0,
      chartData: Object.values(bySetor),
    }
  }, [funcionarios])

  const chartConfig = {
    custo: { label: 'Custo Total', color: 'hsl(var(--destructive))' },
    receita: { label: 'Receita Gerada', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Equipe</p>
                <h3 className="text-2xl font-bold">{funcionarios.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Custo Total Folha</p>
                <h3 className="text-2xl font-bold">
                  R$ {metrics.totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Receita Atribuída</p>
                <h3 className="text-2xl font-bold">
                  R$ {metrics.totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${
                  metrics.percentualCusto > 30
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Custo vs Receita</p>
                <h3 className="text-2xl font-bold">{metrics.percentualCusto.toFixed(1)}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custo vs Receita por Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={metrics.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="setor" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="custo" fill="var(--color-custo)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
