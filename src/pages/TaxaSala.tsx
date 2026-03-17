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
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
          Registro de Taxa de Sala
        </h1>
        <p className="text-muted-foreground text-[16px]">
          Preencha as despesas operacionais fixas e cadastre as salas. Os valores são salvos
          automaticamente.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/80 overflow-hidden">
        <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
          <h2 className="text-primary font-bold text-[13px] tracking-widest uppercase">
            Despesas Operacionais Fixas
          </h2>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="hover:bg-transparent border-b-border">
                <TableHead className="text-muted-foreground font-medium h-12 px-6">
                  Categoria
                </TableHead>
                <TableHead className="text-muted-foreground font-medium h-12 px-6 text-right w-48">
                  Valor (R$)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseCategories.map((category) => (
                <TableRow key={category} className="hover:bg-secondary/30 border-b-border/50">
                  <TableCell className="py-3 px-6 text-[14px] font-medium text-foreground">
                    {category}
                  </TableCell>
                  <TableCell className="py-2 px-6 text-right">
                    <div className="flex justify-end">
                      <Input
                        type="number"
                        min="0"
                        className="h-10 w-32 px-3 text-right border-border bg-background text-[14px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                        value={expenses[category] ?? '0'}
                        onChange={(e) => handleExpenseChange(category, e.target.value)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent bg-secondary/50 border-t border-border">
                <TableCell className="py-5 px-6 text-[15px] font-bold text-foreground uppercase tracking-wider">
                  Total
                </TableCell>
                <TableCell className="py-5 px-6 text-right font-bold text-primary text-[16px]">
                  {formatCurrency(totalExpenses)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-[16px] font-bold text-foreground">Salas Cadastradas</h2>
        </div>
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="hover:bg-transparent border-b-border">
              <TableHead className="text-muted-foreground font-medium h-11 px-6">
                Nome da sala
              </TableHead>
              <TableHead className="text-muted-foreground font-medium h-11 px-6">
                Horas/Mês
              </TableHead>
              <TableHead className="text-muted-foreground font-medium h-11 px-6">
                Dias trab.
              </TableHead>
              <TableHead className="text-muted-foreground font-medium h-11 px-6 text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-secondary/30">
              <TableCell className="py-4 px-6 text-[14px] font-medium text-foreground">
                Sala Dr. Márcio
              </TableCell>
              <TableCell className="py-4 px-6 text-[14px] text-muted-foreground">176</TableCell>
              <TableCell className="py-4 px-6 text-[14px] text-muted-foreground">22</TableCell>
              <TableCell className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
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
        <h2 className="text-2xl font-bold text-foreground mb-6">Visão de Custos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kpiCards.map((kpi, idx) => (
            <Card
              key={idx}
              className={cn(
                'shadow-sm border-border/60 rounded-2xl transition-all',
                kpi.highlight ? 'border-primary/50 bg-primary/5' : 'bg-card',
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <p
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-widest',
                      kpi.highlight ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {kpi.label}
                  </p>
                  {kpi.highlight && <Info className="w-4 h-4 text-primary opacity-80" />}
                </div>
                <h3
                  className={cn(
                    'text-[28px] font-bold tracking-tight',
                    kpi.highlight ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {formatCurrency(kpi.value)}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center pb-12">
        <div className="bg-card rounded-2xl shadow-sm border border-border/80 overflow-hidden w-full max-w-2xl">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-b-border">
                <TableHead className="text-muted-foreground font-semibold h-12 px-6 text-center text-[13px] uppercase tracking-wider">
                  Salas disponíveis
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-12 px-6 text-center text-[13px] uppercase tracking-wider">
                  Horário disponível
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-12 px-6 text-center text-[13px] uppercase tracking-wider">
                  Dias disponíveis
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell className="py-5 px-6 text-center font-bold text-foreground text-[18px]">
                  1
                </TableCell>
                <TableCell className="py-5 px-6 text-center font-bold text-foreground text-[18px]">
                  176
                </TableCell>
                <TableCell className="py-5 px-6 text-center font-bold text-foreground text-[18px]">
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
