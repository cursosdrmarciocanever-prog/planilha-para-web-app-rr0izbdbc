import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Settings2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  faturamento: z.coerce.number().min(0),
  consultas: z.coerce.number().int().min(0),
  servicos: z.coerce.number().int().min(0),
  bilheteria: z.coerce.number().min(0),
})

export type MetasDiarias = z.infer<typeof formSchema>

export function MetasDialog({
  metas,
  setMetas,
}: {
  metas: MetasDiarias
  setMetas: (val: MetasDiarias) => void
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<MetasDiarias>({
    resolver: zodResolver(formSchema),
    defaultValues: metas,
  })

  const onSubmit = (values: MetasDiarias) => {
    setMetas(values)
    toast({
      title: 'Metas atualizadas',
      description: 'Suas metas diárias foram salvas com sucesso.',
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 bg-white shadow-sm hover:bg-slate-50 flex-1 md:flex-none flex items-center gap-2"
        >
          <Settings2 className="w-4 h-4" />
          Configurar Metas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Metas Diárias</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="faturamento"
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
                name="consultas"
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
                name="servicos"
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
              Salvar Metas
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
