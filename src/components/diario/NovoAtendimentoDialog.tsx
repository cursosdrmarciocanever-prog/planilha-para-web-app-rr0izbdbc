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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { createDiarioAtendimento } from '@/services/diario_atendimentos'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  data: z.date({ required_error: 'A data é obrigatória.' }),
  paciente_nome: z.string().min(1, 'O nome do paciente é obrigatório.'),
  valor_consulta: z.coerce.number().min(0),
  valor_procedimento: z.coerce.number().min(0),
  forma_pagamento: z.string().min(1, 'Selecione uma forma de pagamento.'),
  parcelas: z.coerce
    .number()
    .min(2, 'Mínimo de 2 parcelas')
    .max(24, 'Máximo de 24 parcelas')
    .optional()
    .or(z.literal(0))
    .or(z.nan()),
  conta_recebimento: z.string().min(1, 'Selecione uma conta de recebimento.'),
  recibo: z.string().optional(),
  nota_fiscal: z.string().optional(),
})

export function NovoAtendimentoDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date(),
      paciente_nome: '',
      valor_consulta: 0,
      valor_procedimento: 0,
      forma_pagamento: 'PIX',
      parcelas: undefined,
      conta_recebimento: 'Carnê Leão / Unicred',
      recibo: 'Não',
      nota_fiscal: 'Não',
    },
  })

  const formaPagamento = form.watch('forma_pagamento')
  const contaRecebimento = form.watch('conta_recebimento')

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (
      values.forma_pagamento === 'Cartão de Crédito Parcelado' &&
      (!values.parcelas || values.parcelas < 2)
    ) {
      form.setError('parcelas', { type: 'manual', message: 'Mínimo de 2 parcelas.' })
      return
    }

    if (values.conta_recebimento === 'Carnê Leão / Unicred' && !values.recibo) {
      form.setError('recibo', { type: 'manual', message: 'Selecione se possui recibo.' })
      return
    }

    if (values.conta_recebimento === 'Conta Jurídica / Sicoob' && !values.nota_fiscal) {
      form.setError('nota_fiscal', { type: 'manual', message: 'Selecione se possui nota fiscal.' })
      return
    }

    try {
      const year = values.data.getFullYear()
      const month = String(values.data.getMonth() + 1).padStart(2, '0')
      const day = String(values.data.getDate()).padStart(2, '0')

      await createDiarioAtendimento({
        data: `${year}-${month}-${day}`,
        paciente_nome: values.paciente_nome,
        valor_consulta: values.valor_consulta,
        valor_procedimento: values.valor_procedimento,
        forma_pagamento: values.forma_pagamento,
        parcelas:
          values.forma_pagamento === 'Cartão de Crédito Parcelado' ? Number(values.parcelas) : null,
        conta_recebimento: values.conta_recebimento,
        recibo: values.conta_recebimento === 'Carnê Leão / Unicred' ? values.recibo : null,
        nota_fiscal:
          values.conta_recebimento === 'Conta Jurídica / Sicoob' ? values.nota_fiscal : null,
      })

      toast({ title: 'Sucesso', description: 'Atendimento registrado com sucesso.' })
      setOpen(false)
      form.reset({
        data: new Date(),
        paciente_nome: '',
        valor_consulta: 0,
        valor_procedimento: 0,
        forma_pagamento: 'PIX',
        parcelas: undefined,
        conta_recebimento: 'Carnê Leão / Unicred',
        recibo: 'Não',
        nota_fiscal: 'Não',
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao registrar o atendimento.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) form.reset({ ...form.getValues(), data: new Date() })
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex-1 md:flex-none bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium gap-2 shadow-sm rounded-lg h-10 px-4">
          <Plus className="w-4 h-4" /> Novo Atendimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Registrar Novo Atendimento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Atendimento *</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paciente_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Paciente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maria Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor_consulta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Consulta (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor_procedimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Proced. (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Débito">Débito</SelectItem>
                      <SelectItem value="Cartão de Crédito à Vista">
                        Cartão de Crédito à Vista
                      </SelectItem>
                      <SelectItem value="Cartão de Crédito Parcelado">
                        Cartão de Crédito Parcelado
                      </SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formaPagamento === 'Cartão de Crédito Parcelado' && (
              <FormField
                control={form.control}
                name="parcelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        max="24"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="conta_recebimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta de Recebimento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Carnê Leão / Unicred">Carnê Leão / Unicred</SelectItem>
                      <SelectItem value="Conta Jurídica / Sicoob">
                        Conta Jurídica / Sicoob
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {contaRecebimento === 'Carnê Leão / Unicred' && (
              <FormField
                control={form.control}
                name="recibo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recibo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {contaRecebimento === 'Conta Jurídica / Sicoob' && (
              <FormField
                control={form.control}
                name="nota_fiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota Fiscal *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full mt-4">
              Salvar Atendimento
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
