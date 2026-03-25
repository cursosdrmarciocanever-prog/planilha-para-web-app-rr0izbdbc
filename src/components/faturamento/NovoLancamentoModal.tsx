import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function NovoLancamentoModal({ open, onOpenChange, onSuccess, initialData }: any) {
  const [dataAtendimento, setDataAtendimento] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [nomePaciente, setNomePaciente] = useState('')
  const [tipo, setTipo] = useState('Consulta')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDataAtendimento(initialData.data_atendimento)
        setNomePaciente(initialData.nome_paciente)
        setTipo(initialData.tipo)
        setDescricao(initialData.descricao || '')
        setValor(initialData.valor.toString())
        setFormaPagamento(initialData.forma_pagamento || 'PIX')
        setObservacoes(initialData.observacoes || '')
      } else {
        setDataAtendimento(format(new Date(), 'yyyy-MM-dd'))
        setNomePaciente('')
        setTipo('Consulta')
        setDescricao('')
        setValor('')
        setFormaPagamento('PIX')
        setObservacoes('')
      }
    }
  }, [open, initialData])

  const handleSave = async () => {
    if (!nomePaciente || !valor) {
      toast({
        title: 'Atenção',
        description: 'Preencha o nome do paciente e o valor.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const payload = {
      data_atendimento: dataAtendimento,
      nome_paciente: nomePaciente,
      tipo,
      descricao,
      valor: parseFloat(valor),
      forma_pagamento: formaPagamento,
      observacoes,
    }

    const { data: userData } = await supabase.auth.getUser()

    let error
    if (initialData?.id) {
      const res = await supabase
        .from('lancamentos_pacientes')
        .update(payload)
        .eq('id', initialData.id)
      error = res.error
    } else {
      const res = await supabase
        .from('lancamentos_pacientes')
        .insert([{ ...payload, user_id: userData.user?.id }])
      error = res.error
    }

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar lançamento.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Lançamento salvo com sucesso.' })
      onSuccess()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-4">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-foreground/80 font-medium">Data do Atendimento *</Label>
              <Input
                type="date"
                value={dataAtendimento}
                onChange={(e) => setDataAtendimento(e.target.value)}
                className="bg-secondary/30 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 font-medium">Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="bg-secondary/30 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Procedimento">Procedimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80 font-medium">Nome do Paciente *</Label>
            <Input
              value={nomePaciente}
              onChange={(e) => setNomePaciente(e.target.value)}
              placeholder="Ex: João Silva"
              className="bg-secondary/30 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80 font-medium">Descrição (Opcional)</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Avaliação Hormonal"
              className="bg-secondary/30 h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-foreground/80 font-medium">Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
                className="bg-secondary/30 h-11 font-bold text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 font-medium">Forma de Pagamento *</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger className="bg-secondary/30 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80 font-medium">Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações opcionais..."
              className="resize-none bg-secondary/30 min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter className="mt-8 border-t border-border/40 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-full px-8">
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
