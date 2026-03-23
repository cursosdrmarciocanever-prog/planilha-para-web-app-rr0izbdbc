import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, TrendingUp } from 'lucide-react'

export function SimuladorROI() {
  const [salario, setSalario] = useState(3000)
  const [encargos, setEncargos] = useState(47.44)
  const [beneficios, setBeneficios] = useState(500)
  const [receita, setReceita] = useState(15000)

  const custoTotal = salario * (1 + encargos / 100) + beneficios
  const percentualCusto = receita > 0 ? (custoTotal / receita) * 100 : 0
  const roi = receita > 0 ? ((receita - custoTotal) / custoTotal) * 100 : 0

  const isRisk = percentualCusto > 30

  const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros da Simulação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Salário Pretendido (R$)</Label>
            <Input
              type="number"
              value={salario}
              onChange={(e) => setSalario(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Encargos (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={encargos}
                onChange={(e) => setEncargos(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Benefícios Mensais (R$)</Label>
              <Input
                type="number"
                value={beneficios}
                onChange={(e) => setBeneficios(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2 pt-4 border-t">
            <Label>Expectativa de Receita (R$)</Label>
            <Input
              type="number"
              value={receita}
              onChange={(e) => setReceita(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={isRisk ? 'border-red-300 shadow-sm' : ''}>
        <CardHeader>
          <CardTitle>Projeção de Impacto (GM Metrics)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium">Custo Total Projetado</span>
            <span className="text-2xl font-bold">{brl(custoTotal)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Comprometimento da Receita (Custo / Receita)</span>
              <span className={`font-bold ${isRisk ? 'text-red-600' : 'text-green-600'}`}>
                {percentualCusto.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${isRisk ? 'bg-red-500' : 'bg-green-500'} transition-all duration-500`}
                style={{ width: `${Math.min(percentualCusto, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-right">Ideal: Abaixo de 30%</p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 text-blue-900 border border-blue-100">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium">ROI Estimado (Retorno sobre Investimento)</p>
              <p className="text-xl font-bold">{roi.toFixed(1)}%</p>
            </div>
          </div>

          {isRisk && (
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>
                <strong>Atenção:</strong> A contratação nestes termos compromete mais de 30% da
                receita gerada. Recomenda-se ajustar a meta de receita para pelo menos{' '}
                <strong>{brl(custoTotal / 0.3)}</strong>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
