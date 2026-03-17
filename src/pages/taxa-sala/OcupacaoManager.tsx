import { useState, useEffect } from 'react'
import { Plus, Trash2, CalendarDays } from 'lucide-react'
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
import {
  getOcupacoes,
  addOcupacao,
  deleteOcupacao,
  getSalas,
  getPacientesSimples,
} from '@/services/taxa-sala'
import { Ocupacao, Sala, Paciente } from '@/types/taxa-sala'
import { toast } from '@/hooks/use-toast'

export default function OcupacaoManager() {
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    sala_id: '',
    paciente_id: '',
    data_inicio: '',
    data_fim: '',
    valor_cobrado: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
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
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' })
    }
  }

  const handleAutoCalc = () => {
    if (!formData.sala_id || !formData.data_inicio || !formData.data_fim) return
    const sala = salas.find((s) => s.id.toString() === formData.sala_id)
    if (!sala) return
    const start = new Date(formData.data_inicio).getTime()
    const end = new Date(formData.data_fim).getTime()
    if (end <= start) return
    const diffHours = (end - start) / (1000 * 60 * 60)
    setFormData((prev) => ({ ...prev, valor_cobrado: (diffHours * sala.taxa_hora).toFixed(2) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const pId =
        formData.paciente_id && formData.paciente_id !== 'none' ? formData.paciente_id : null
      await addOcupacao({
        sala_id: Number(formData.sala_id),
        paciente_id: pId,
        data_inicio: new Date(formData.data_inicio).toISOString(),
        data_fim: new Date(formData.data_fim).toISOString(),
        valor_cobrado: Number(formData.valor_cobrado),
      })
      toast({ title: 'Sucesso', description: 'Ocupação registrada com sucesso.' })
      setOpen(false)
      loadData()
      setFormData({
        sala_id: '',
        paciente_id: '',
        data_inicio: '',
        data_fim: '',
        valor_cobrado: '',
      })
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta ocupação?')) return
    try {
      await deleteOcupacao(id)
      loadData()
      toast({ title: 'Sucesso', description: 'Ocupação excluída.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Registro de Ocupações</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe as reservas e faturamentos por sala.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Nova Ocupação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Ocupação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Sala</Label>
                <Select
                  value={formData.sala_id}
                  onValueChange={(val) => setFormData({ ...formData, sala_id: val })}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    onBlur={handleAutoCalc}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    onBlur={handleAutoCalc}
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
                />
              </div>
              <Button type="submit" className="w-full mt-2 rounded-full">
                Salvar Ocupação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl shadow-sm border border-border/80 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead className="px-6 h-12">Sala</TableHead>
              <TableHead className="h-12">Paciente</TableHead>
              <TableHead className="h-12">Período</TableHead>
              <TableHead className="h-12">Valor</TableHead>
              <TableHead className="text-right px-6 h-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ocupacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhuma ocupação registrada.
                </TableCell>
              </TableRow>
            ) : (
              ocupacoes.map((ocup) => (
                <TableRow key={ocup.id} className="hover:bg-secondary/30">
                  <TableCell className="font-medium px-6 py-4">{ocup.sala?.nome}</TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    {ocup.paciente?.nome || 'Não associado'}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="w-4 h-4 text-primary opacity-70" />
                      <span>
                        {format(new Date(ocup.data_inicio), 'dd/MM HH:mm', { locale: ptBR })} às{' '}
                        {format(new Date(ocup.data_fim), 'HH:mm')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-medium text-foreground">
                    R$ {Number(ocup.valor_cobrado).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ocup.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
