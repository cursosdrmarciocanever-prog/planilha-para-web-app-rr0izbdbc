import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Calculator } from 'lucide-react'

export function DespesasFixasTable({ valores, setValores }: any) {
  const total = valores.reduce((acc: number, v: any) => acc + (Number(v.valor) || 0), 0)

  const handleEdit = (id: string, newVal: string) => {
    setValores(valores.map((v: any) => (v.id === id ? { ...v, valor: newVal } : v)))
  }

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 flex flex-col h-full bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-secondary/10">
        <CardTitle className="text-base flex items-center gap-2 font-bold uppercase tracking-wider text-muted-foreground">
          <Calculator className="w-4 h-4 text-primary" />
          Despesas Operacionais Fixas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto max-h-[450px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-md z-10 shadow-sm border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 text-xs font-semibold uppercase">Categoria</TableHead>
                <TableHead className="text-right h-10 text-xs font-semibold uppercase w-[130px]">
                  Valor (R$)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {valores.map((v: any) => (
                <TableRow key={v.id} className="group hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium text-[13px] text-foreground py-2 border-b border-border/40">
                    {v.nome}
                  </TableCell>
                  <TableCell className="py-2 px-2 border-b border-border/40">
                    <Input
                      type="number"
                      step="0.01"
                      value={v.valor}
                      onChange={(e) => handleEdit(v.id, e.target.value)}
                      className="h-8 text-right text-[13px] font-medium bg-transparent border-transparent hover:border-input focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-all shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 bg-secondary/30 flex justify-between items-center font-bold text-sm border-t border-border/40 z-20">
          <span className="uppercase tracking-widest text-muted-foreground">TOTAL</span>
          <span className="text-primary text-xl tracking-tight">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
