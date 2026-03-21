import { useState, useEffect } from 'react'
import { Building2, Plus, Trash2, Loader2 } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { getSalas, addSala, deleteSala } from '@/services/taxa-sala'
import { Sala } from '@/types/taxa-sala'
import { toast } from '@/hooks/use-toast'

export default function SalaManager() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ nome: '', taxa_hora: '', taxa_dia: '' })

  useEffect(() => {
    loadSalas()
  }, [])

  const loadSalas = async () => {
    setLoading(true)
    try {
      const data = await getSalas()
      setSalas(data)
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao carregar salas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return
    try {
      await deleteSala(id)
      loadSalas()
      toast({ title: 'Sucesso', description: 'Sala excluída com sucesso.' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a sala.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gerenciar Salas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as taxas de hora e dia para cada sala.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-sm w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Nova Sala
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Sala</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Sala</Label>
                <Input
                  id="nome"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Sala de Exames"
                  className="bg-secondary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxa_hora">Taxa Hora (R$)</Label>
                  <Input
                    id="taxa_hora"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.taxa_hora}
                    onChange={(e) => setFormData({ ...formData, taxa_hora: e.target.value })}
                    className="bg-secondary/20"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxa_dia">Taxa Dia (R$)</Label>
                  <Input
                    id="taxa_dia"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.taxa_dia}
                    onChange={(e) => setFormData({ ...formData, taxa_dia: e.target.value })}
                    className="bg-secondary/20"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full mt-4 rounded-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Sala'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl shadow-sm border border-border/80 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 h-12">Nome da Sala</TableHead>
              <TableHead className="h-12">Taxa Hora</TableHead>
              <TableHead className="h-12">Taxa Dia</TableHead>
              <TableHead className="text-right px-6 h-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-5 w-32" />
                    </div>
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
            ) : salas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-[300px] text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="bg-secondary/50 p-4 rounded-full mb-4">
                      <Building2 className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-base font-medium text-foreground">Nenhuma sala cadastrada</p>
                    <p className="text-sm mt-1">
                      Adicione sua primeira sala para começar a registrar ocupações.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              salas.map((sala) => (
                <TableRow key={sala.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium px-6 py-4 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Building2 className="w-4 h-4" />
                    </div>
                    {sala.nome}
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    R$ {Number(sala.taxa_hora).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    R$ {Number(sala.taxa_dia).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sala.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 transition-colors"
                      title="Excluir Sala"
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
