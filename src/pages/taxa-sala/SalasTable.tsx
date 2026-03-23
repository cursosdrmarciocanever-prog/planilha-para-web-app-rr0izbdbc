import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Edit, Building2, Loader2 } from 'lucide-react'
import { addSala, deleteSala, updateSala } from '@/services/taxa-sala'
import { useToast } from '@/hooks/use-toast'

export function SalasTable({ salas, reload }: any) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    horas_mes: '220',
    dias_mes: '22',
    taxa_hora: '0',
    taxa_dia: '0',
  })
  const [loading, setLoading] = useState(false)

  const handleOpen = (sala?: any) => {
    if (sala) {
      setEditId(sala.id)
      setFormData({
        nome: sala.nome,
        horas_mes: String(sala.horas_mes || 220),
        dias_mes: String(sala.dias_mes || 22),
        taxa_hora: String(sala.taxa_hora || 0),
        taxa_dia: String(sala.taxa_dia || 0),
      })
    } else {
      setEditId(null)
      setFormData({ nome: '', horas_mes: '220', dias_mes: '22', taxa_hora: '0', taxa_dia: '0' })
    }
    setOpen(true)
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        nome: formData.nome,
        horas_mes: Number(formData.horas_mes),
        dias_mes: Number(formData.dias_mes),
        taxa_hora: Number(formData.taxa_hora),
        taxa_dia: Number(formData.taxa_dia),
      }
      if (editId) await updateSala(editId, payload)
      else await addSala(payload)
      toast({ title: 'Sucesso', description: 'Sala salva com sucesso.' })
      setOpen(false)
      reload()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao salvar sala.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return
    try {
      await deleteSala(id)
      toast({ title: 'Sucesso', description: 'Sala excluída com sucesso.' })
      reload()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  return (
    <Card className="shadow-sm rounded-3xl border-border/60 flex flex-col bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between bg-secondary/10">
        <CardTitle className="text-base flex items-center gap-2 font-bold uppercase tracking-wider text-muted-foreground">
          <Building2 className="w-4 h-4 text-primary" /> Salas Cadastradas
        </CardTitle>
        <Button
          onClick={() => handleOpen()}
          size="sm"
          variant="outline"
          className="h-8 rounded-full shadow-sm text-xs bg-background"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Nova
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto max-h-[300px]">
        <Table>
          <TableHeader className="bg-background/95 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 text-xs font-semibold uppercase">Nome</TableHead>
              <TableHead className="h-10 text-xs font-semibold uppercase text-center">
                Horas/mês
              </TableHead>
              <TableHead className="h-10 text-xs font-semibold uppercase text-center">
                Dias/mês
              </TableHead>
              <TableHead className="h-10 w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma sala cadastrada
                </TableCell>
              </TableRow>
            ) : (
              salas.map((s: any) => (
                <TableRow key={s.id} className="group hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium text-[13px] py-3">{s.nome}</TableCell>
                  <TableCell className="text-center text-[13px] py-3">
                    {s.horas_mes || 220}
                  </TableCell>
                  <TableCell className="text-center text-[13px] py-3">{s.dias_mes || 22}</TableCell>
                  <TableCell className="p-1 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-background"
                        onClick={() => handleOpen(s)}
                      >
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive/10"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Sala' : 'Cadastrar Sala'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome da Sala</Label>
              <Input
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Consultório 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horas/mês</Label>
                <Input
                  type="number"
                  required
                  value={formData.horas_mes}
                  onChange={(e) => setFormData({ ...formData, horas_mes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Dias trabalhados/mês</Label>
                <Input
                  type="number"
                  required
                  value={formData.dias_mes}
                  onChange={(e) => setFormData({ ...formData, dias_mes: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taxa Hora (Opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.taxa_hora}
                  onChange={(e) => setFormData({ ...formData, taxa_hora: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Taxa Dia (Opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.taxa_dia}
                  onChange={(e) => setFormData({ ...formData, taxa_dia: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-4 rounded-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                'Salvar Sala'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
