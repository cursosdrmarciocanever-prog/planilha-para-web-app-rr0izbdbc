import { useState, useEffect } from 'react'
import { Building2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { getSalas, addSala, deleteSala } from '@/services/taxa-sala'
import { Sala } from '@/types/taxa-sala'
import { toast } from '@/hooks/use-toast'

export default function SalaManager() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ nome: '', taxa_hora: '', taxa_dia: '' })

  useEffect(() => {
    loadSalas()
  }, [])

  const loadSalas = async () => {
    try {
      const data = await getSalas()
      setSalas(data)
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao carregar salas', variant: 'destructive' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addSala({
        nome: formData.nome,
        taxa_hora: Number(formData.taxa_hora),
        taxa_dia: Number(formData.taxa_dia),
      })
      toast({ title: 'Sucesso', description: 'Sala cadastrada com sucesso.' })
      setOpen(false)
      loadSalas()
      setFormData({ nome: '', taxa_hora: '', taxa_dia: '' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return
    try {
      await deleteSala(id)
      loadSalas()
      toast({ title: 'Sucesso', description: 'Sala excluída.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gerenciar Salas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as taxas de hora e dia para cada sala.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Nova Sala
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Sala</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome da Sala</Label>
                <Input
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Sala de Exames"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Taxa Hora (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.taxa_hora}
                    onChange={(e) => setFormData({ ...formData, taxa_hora: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa Dia (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.taxa_dia}
                    onChange={(e) => setFormData({ ...formData, taxa_dia: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-2 rounded-full">
                Salvar Sala
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl shadow-sm border border-border/80 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead className="px-6 h-12">Nome da Sala</TableHead>
              <TableHead className="h-12">Taxa Hora</TableHead>
              <TableHead className="h-12">Taxa Dia</TableHead>
              <TableHead className="text-right px-6 h-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Nenhuma sala cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              salas.map((sala) => (
                <TableRow key={sala.id} className="hover:bg-secondary/30">
                  <TableCell className="font-medium px-6 py-4 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    {sala.nome}
                  </TableCell>
                  <TableCell className="py-4">R$ {Number(sala.taxa_hora).toFixed(2)}</TableCell>
                  <TableCell className="py-4">R$ {Number(sala.taxa_dia).toFixed(2)}</TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sala.id)}
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
