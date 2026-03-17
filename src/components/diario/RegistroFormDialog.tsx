import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { createRegistro } from '@/services/registros_diarios'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  data: z.date({ required_error: 'A data é obrigatória.' }),
  faturamento_total: z.coerce.number().min(0),
  total_consultas: z.coerce.number().int().min(0),
  total_servicos: z.coerce.number().int().min(0),
  bilheteria: z.coerce.number().min(0),
})

export function RegistroFormDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const year = values.data.getFullYear()
      const month = String(values.data.getMonth() + 1).padStart(2, '0')
      const day = String(values.data.getDate()).padStart(2, '0')

      await createRegistro({
        data: `${year}-${month}-${day}`,
        faturamento_total: values.faturamento_total,
        total_consultas: values.total_consultas,
        total_servicos: values.total_servicos,
        bilheteria: values.bilheteria,
      })

      toast({ title: 'Sucesso', description: 'Registro salvo com sucesso.' })
      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: 'Atenção',
          description: 'Já existe um registro para esta data.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Erro', description: 'Falha ao salvar o registro.', variant: 'destructive' })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 md:flex-none bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4">
          <Plus className="w-4 h-4" /> Novo Registro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Registro Diário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Registro</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
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
              Salvar Registro
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
