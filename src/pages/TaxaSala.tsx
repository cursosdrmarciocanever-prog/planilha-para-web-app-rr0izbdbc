import { useState } from 'react'
import { Building2, Pencil, Trash2, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const expenseCategories = [
  'Aluguel da sala',
  'Água, luz e internet',
  'Salários e benefícios',
  'Manutenção e',
  'Seguros',
  'Licenças, taxas e condomínio',
  'Contabilidade',
  'Jurídico',
  'Marketing e acessórios',
  'Sistema de gestão',
  'Verba de impulsionamento',
  'Financiamento',
  'Outros',
]

const kpiCards = [
  { label: 'CUSTOS TOTAIS', value: 0 },
  { label: 'OPERACIONAIS FIXAS/DIA', value: 0 },
  { label: 'CUSTO SALA/', value: 0 },
  { label: 'CUSTO POR TURNO/', value: 0 },
  { label: 'TURNO SEMANAL', value: 0 },
  { label: 'SALA DIA', value: 0 },
  { label: 'CUSTO HORA OCUPA. 100%', value: 0, highlight: true },
  { label: 'CUSTO HORA OCUPA 50%', value: 0 },
  { label: 'CUSTO HORA OCUPA 20%', value: 0 },
]

export default function TaxaSala() {
  const [expenses, setExpenses] = useState<Record<string, string>>({})

  const handleExpenseChange = (category: string, value: string) => {
    setExpenses((prev) => ({ ...prev, [category]: value }))
  }

  const totalExpenses = expenseCategories.reduce((acc, cat) => {
    const val = parseFloat(expenses[cat])
    return acc + (isNaN(val) ? 0 : val)
  }, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
          Registro de taxa de sala
        </h1>
        <p className="text-slate-500 text-[15px]">
          Preencha as despesas operacionais fixas e cadastradas nas salas. Os valores são salvos
          automaticamente.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#3b5bdb] px-6 py-3.5">
          <h2 className="text-white font-semibold text-[13px] tracking-wide">
            DESPESAS ESPER FIXAS
          </h2>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="text-slate-600 font-medium h-12 px-6">Categoria</TableHead>
                <TableHead className="text-slate-600 font-medium h-12 px-6 text-right w-48">
                  Valor (R$)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseCategories.map((category) => (
                <TableRow key={category} className="hover:bg-slate-50/50 border-b-slate-100">
                  <TableCell className="py-3 px-6 text-[14px] font-medium text-slate-700">
                    {category}
                  </TableCell>
                  <TableCell className="py-2 px-6 text-right">
                    <div className="flex justify-end">
                      <Input
                        type="number"
                        min="0"
                        className="h-9 w-32 px-3 text-right border-slate-200 text-[14px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-1 focus-visible:ring-[#3b5bdb] focus-visible:border-[#3b5bdb]"
                        value={expenses[category] ?? '0'}
                        onChange={(e) => handleExpenseChange(category, e.target.value)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent bg-slate-50/40">
                <TableCell className="py-4 px-6 text-[15px] font-bold text-slate-900">
                  Total
                </TableCell>
                <TableCell className="py-4 px-6 text-right font-bold text-slate-900 text-[15px]">
                  {formatCurrency(totalExpenses)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-[#3b5bdb]" />
          <h2 className="text-[15px] font-semibold text-slate-900">Salas</h2>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b-slate-100">
              <TableHead className="text-slate-600 font-medium h-11 px-6">Nome da sala</TableHead>
              <TableHead className="text-slate-600 font-medium h-11 px-6">Horas/ ;</TableHead>
              <TableHead className="text-slate-600 font-medium h-11 px-6">Dias trab.</TableHead>
              <TableHead className="text-slate-600 font-medium h-11 px-6 text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-slate-50/50">
              <TableCell className="py-3.5 px-6 text-[14px] text-slate-700">
                sala dr marcio
              </TableCell>
              <TableCell className="py-3.5 px-6 text-[14px] text-slate-700">176</TableCell>
              <TableCell className="py-3.5 px-6 text-[14px] text-slate-700">22</TableCell>
              <TableCell className="py-3.5 px-6 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-[#3b5bdb]"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold text-slate-900 mb-5">Visão de custos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kpiCards.map((kpi, idx) => (
            <Card
              key={idx}
              className={cn(
                'shadow-sm border-slate-200/80 rounded-xl transition-all',
                kpi.highlight ? 'border-[#3b5bdb] bg-blue-50/30' : 'bg-white',
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <p
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-wider',
                      kpi.highlight ? 'text-[#3b5bdb]' : 'text-slate-500',
                    )}
                  >
                    {kpi.label}
                  </p>
                  {kpi.highlight && <Info className="w-3.5 h-3.5 text-[#3b5bdb]" />}
                </div>
                <h3
                  className={cn(
                    'text-[26px] font-bold tracking-tight',
                    kpi.highlight ? 'text-[#3b5bdb]' : 'text-slate-900',
                  )}
                >
                  {formatCurrency(kpi.value)}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full max-w-2xl">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="text-slate-600 font-semibold h-11 px-6 text-center text-[13px]">
                  Salas disponíveis
                </TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 px-6 text-center text-[13px]">
                  Horário disponível
                </TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 px-6 text-center text-[13px]">
                  Total de dias disponíveis
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell className="py-4 px-6 text-center font-bold text-slate-800 text-[15px]">
                  1
                </TableCell>
                <TableCell className="py-4 px-6 text-center font-bold text-slate-800 text-[15px]">
                  176
                </TableCell>
                <TableCell className="py-4 px-6 text-center font-bold text-slate-800 text-[15px]">
                  22
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
