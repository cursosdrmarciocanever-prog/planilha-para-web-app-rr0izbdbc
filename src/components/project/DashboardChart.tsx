import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'Jan', entrada: 4000, saida: 2400 },
  { name: 'Fev', entrada: 3000, saida: 1398 },
  { name: 'Mar', entrada: 2000, saida: 9800 },
  { name: 'Abr', entrada: 2780, saida: 3908 },
  { name: 'Mai', entrada: 1890, saida: 4800 },
  { name: 'Jun', entrada: 2390, saida: 3800 },
]

export function DashboardChart() {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer
        config={{
          entrada: { label: 'Entrada', color: 'hsl(var(--primary))' },
          saida: { label: 'Saída', color: 'hsl(var(--chart-3))' },
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
            <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
            <Bar dataKey="entrada" fill="var(--color-entrada)" radius={[4, 4, 0, 0]} barSize={30} />
            <Bar dataKey="saida" fill="var(--color-saida)" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
