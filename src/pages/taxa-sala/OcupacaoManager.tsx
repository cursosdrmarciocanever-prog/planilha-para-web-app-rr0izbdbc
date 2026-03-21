import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CalendarDays, Loader2, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  getOcupacoes,
  addOcupacao,
  deleteOcupacao,
  getSalas,
  getPacientesSimples,
} from '@/services/taxa-sala'
import { Ocupacao, Sala, Paciente } from '@/types/taxa-sala'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function OcupacaoManager() {
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    sala_id: '',
    paciente_id: '',
    horario_inicio: '',
    horario_fim: '',
    valor_cobrado: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ocupData, salasData, pacData] = await Promise.all([
        getOcupacoes(),
        getSalas(),
        getPacientesSimples(),
      ])
      setOcupacoes(ocupData)
      setSalas(salasData)
      setPacientes(pacData)
    } catch (e) {
      setError('Falha ao obter os registros de ocupação ou dependências. Verifique sua conexão.')
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAutoCalc = () => {
    if (!formData.sala_id || !formData.horario_inicio || !formData.horario_fim) return
    const sala = salas.find((s) => s.id.toString() === formData.sala_id)
    if (!sala) return
    const start = new Date(formData.horario_inicio).getTime()
    const end = new Date(formData.horario_fim).getTime()
    if (end <= start) return
    const diffHours = (end - start) / (1000 * 60 * 60)
    setFormData((prev) => ({
      ...prev,
      valor_cobrado: (diffHours * Number(sala.taxa_hora)).toFixed(2),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const pId =
        formData.paciente_id && formData.paciente_id !== 'none' ? formData.paciente_id : null
      await addOcupacao({
        sala_id: formData.sala_id,
        paciente_id: pId,
        horario_inicio: new Date(formData.horario_inicio).toISOString(),
        horario_fim: new Date(formData.horario_fim).toISOString(),
        valor_cobrado: Number(formData.valor_cobrado),
      })
      toast({ title: 'Sucesso', description: 'Ocupação registrada com sucesso.' })
      setOpen(false)
      loadData()
      setFormData({
        sala_id: '',
        paciente_id: '',
        horario_inicio: '',
        horario_fim: '',
        valor_cobrado: '',
      })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o registro.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta ocupação?')) return
    try {
      await deleteOcupacao(id)
      loadData()
      toast({ title: 'Sucesso', description: 'Ocupação excluída com sucesso.' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o registro.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Registro de Ocupações</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe o uso das salas, faturamento e margem de contribuição de cada sessão.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-sm w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Nova Ocupação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Ocupação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label>Sala</Label>
                <Select
                  value={formData.sala_id}
                  onValueChange={(val) => setFormData({ ...formData, sala_id: val })}
                  required
                >
                  <SelectTrigger className="bg-secondary/20">
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paciente (Opcional)</Label>
                <Select
                  value={formData.paciente_id}
                  onValueChange={(val) => setFormData({ ...formData, paciente_id: val })}
                >
                  <SelectTrigger className="bg-secondary/20">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {pacientes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    onBlur={handleAutoCalc}
                    className="bg-secondary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                    onBlur={handleAutoCalc}
                    className="bg-secondary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Valor Cobrado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_cobrado}
                  onChange={(e) => setFormData({ ...formData, valor_cobrado: e.target.value })}
                  className="bg-secondary/20"
                  placeholder="0.00"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full mt-4 rounded-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Ocupação'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="bg-destructive/5 text-destructive border-destructive/20 rounded-2xl"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Erro de Comunicação</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl shadow-sm border border-border/80 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 h-12 w-[20%]">Sala</TableHead>
              <TableHead className="h-12 w-[20%]">Paciente</TableHead>
              <TableHead className="h-12 w-[20%]">Período</TableHead>
              <TableHead className="h-12 w-[15%]">Faturamento</TableHead>
              <TableHead className="h-12 w-[15%]">Margem</TableHead>
              <TableHead className="text-right px-6 h-12 w-[10%]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-5 w-36" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : ocupacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-[300px] text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="bg-secondary/50 p-4 rounded-full mb-4">
                      <CalendarDays className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-base font-medium text-foreground">
                      Nenhuma ocupação registrada
                    </p>
                    <p className="text-sm mt-1">
                      Registre o uso das salas para analisar o faturamento e as margens.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ocupacoes.map((ocup) => {
                const start = new Date(ocup.horario_inicio).getTime()
                const end = new Date(ocup.horario_fim).getTime()
                const diffHours = Math.max(0, (end - start) / (1000 * 60 * 60))
                const taxaHora = Number(ocup.sala?.taxa_hora || 0)
                const custo = diffHours * taxaHora
                const receita = Number(ocup.valor_cobrado || 0)
                const margem = receita - custo

                return (
                  <TableRow key={ocup.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-medium px-6 py-4 text-foreground">
                      {ocup.sala?.nome || 'Sala excluída'}
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground">
                      {ocup.paciente?.nome || (
                        <span className="italic opacity-60">Não associado</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        <span>
                          {format(new Date(ocup.horario_inicio), "dd/MM 'às' HH:mm", {
                            locale: ptBR,
                          })}{' '}
                          - {format(new Date(ocup.horario_fim), 'HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-foreground">
                      R$ {receita.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'py-4 font-medium',
                        margem >= 0 ? 'text-emerald-600' : 'text-destructive',
                      )}
                    >
                      R$ {margem.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ocup.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 transition-colors"
                        title="Excluir Ocupação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
