import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateRegistro, RegistroDiario } from '@/services/registros_diarios'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const formSchema = z.object({
  faturamento_total: z.coerce.number().min(0),
  total_consultas: z.coerce.number().int().min(0),
  total_servicos: z.coerce.number().int().min(0),
  bilheteria: z.coerce.number().min(0),
})

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function EditRegistroDialog({
  registro,
  open,
  onOpenChange,
  onSuccess,
}: {
  registro: RegistroDiario | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faturamento_total: 0,
      total_consultas: 0,
      total_servicos: 0,
      bilheteria: 0,
    },
  })

  useEffect(() => {
    if (registro) {
      form.reset({
        faturamento_total: registro.faturamento_total,
        total_consultas: registro.total_consultas,
        total_servicos: registro.total_servicos,
        bilheteria: registro.bilheteria,
      })
    }
  }, [registro, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!registro) return
    try {
      await updateRegistro(registro.id, values)
      toast({ title: 'Sucesso', description: 'Registro atualizado com sucesso.' })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar o registro.',
        variant: 'destructive',
      })
    }
  }

  if (!registro) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Editar Registro - {format(parseLocalDate(registro.data), 'dd/MM/yyyy')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="faturamento_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faturamento (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bilheteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bilheteria (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_consultas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultas</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_servicos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviços</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              Salvar Alterações
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
