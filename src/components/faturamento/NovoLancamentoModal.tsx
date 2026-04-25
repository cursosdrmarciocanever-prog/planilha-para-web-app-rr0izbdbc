import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  const [categoria, setCategoria] = useState('Consultas')
  const [numeroOrcamento, setNumeroOrcamento] = useState('')
  const [profissionalOrcamento, setProfissionalOrcamento] = useState('')
  const [colaboradorResponsavel, setColaboradorResponsavel] = useState('')
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('PIX')
  const [parcelas, setParcelas] = useState('1')
  const [documentoMaquina, setDocumentoMaquina] = useState('')
  const [notaFiscal, setNotaFiscal] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [duplicateWarning, setDuplicateWarning] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<any>(null)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDataAtendimento(initialData.data_atendimento)
        setNomePaciente(initialData.nome_paciente)
        setCategoria(initialData.categoria || initialData.tipo || 'Consultas')
        setNumeroOrcamento(initialData.numero_orcamento || '')
        setProfissionalOrcamento(initialData.profissional_orcamento || '')
        setColaboradorResponsavel(initialData.colaborador_responsavel || '')
        setValor(initialData.valor.toString())
        setFormaPagamento(initialData.forma_pagamento || 'PIX')
        setParcelas(initialData.parcelas ? initialData.parcelas.toString() : '1')
        setDocumentoMaquina(initialData.documento_maquina || '')
        setNotaFiscal(initialData.nota_fiscal || '')
        setObservacoes(initialData.observacoes || '')
      } else {
        setDataAtendimento(format(new Date(), 'yyyy-MM-dd'))
        setNomePaciente('')
        setCategoria('Consultas')
        setNumeroOrcamento('')
        setProfissionalOrcamento('')
        setColaboradorResponsavel('')
        setValor('')
        setFormaPagamento('PIX')
        setParcelas('1')
        setDocumentoMaquina('')
        setNotaFiscal('')
        setObservacoes('')
      }
      setDuplicateWarning(false)
      setPendingPayload(null)
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
      categoria,
      numero_orcamento: numeroOrcamento,
      profissional_orcamento: profissionalOrcamento,
      colaborador_responsavel: colaboradorResponsavel,
      valor: parseFloat(valor),
      forma_pagamento: formaPagamento,
      parcelas: parseInt(parcelas) || 1,
      documento_maquina: documentoMaquina,
      nota_fiscal: notaFiscal,
      observacoes,
    }

    // Duplicate Check
    const shouldCheck =
      !initialData ||
      initialData.data_atendimento !== dataAtendimento ||
      initialData.nome_paciente !== nomePaciente ||
      initialData.valor !== parseFloat(valor)

    if (shouldCheck) {
      const { data: existing } = await supabase
        .from('lancamentos_pacientes')
        .select('id')
        .eq('nome_paciente', nomePaciente)
        .eq('data_atendimento', dataAtendimento)
        .eq('valor', parseFloat(valor))

      if (existing && existing.length > 0) {
        const others = existing.filter((e) => e.id !== initialData?.id)
        if (others.length > 0) {
          setLoading(false)
          setPendingPayload(payload)
          setDuplicateWarning(true)
          return
        }
      }
    }

    await executeSave(payload)
  }

  const executeSave = async (payload: any) => {
    setDuplicateWarning(false)
    setLoading(true)

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl overflow-y-auto max-h-[90vh]">
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
                <Label className="text-foreground/80 font-medium">Categoria *</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="bg-secondary/30 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultas">Consultas</SelectItem>
                    <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80 font-medium">Paciente *</Label>
              <Input
                value={nomePaciente}
                onChange={(e) => setNomePaciente(e.target.value)}
                placeholder="Nome do paciente"
                className="bg-secondary/30 h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-foreground/80 font-medium">Nº do Orçamento</Label>
                <Input
                  value={numeroOrcamento}
                  onChange={(e) => setNumeroOrcamento(e.target.value)}
                  placeholder="Ex: ORC-123"
                  className="bg-secondary/30 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 font-medium">Profissional (Orçamento)</Label>
                <Input
                  value={profissionalOrcamento}
                  onChange={(e) => setProfissionalOrcamento(e.target.value)}
                  placeholder="Nome do profissional"
                  className="bg-secondary/30 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80 font-medium">Colaborador Responsável</Label>
              <Input
                value={colaboradorResponsavel}
                onChange={(e) => setColaboradorResponsavel(e.target.value)}
                placeholder="Ex: João"
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
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label className="text-foreground/80 font-medium">Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                  className="bg-secondary/30 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 font-medium">Documento Máquina</Label>
                <Input
                  value={documentoMaquina}
                  onChange={(e) => setDocumentoMaquina(e.target.value)}
                  placeholder="Ex: 12345"
                  className="bg-secondary/30 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 font-medium">Nota Fiscal</Label>
                <Input
                  value={notaFiscal}
                  onChange={(e) => setNotaFiscal(e.target.value)}
                  placeholder="Ex: NF-001"
                  className="bg-secondary/30 h-11"
                />
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

      <AlertDialog open={duplicateWarning} onOpenChange={setDuplicateWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lançamento Duplicado Detectado</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe um lançamento para <strong>{nomePaciente}</strong> na data{' '}
              <strong>{format(new Date(dataAtendimento), 'dd/MM/yyyy')}</strong> com o valor de{' '}
              <strong>
                R${' '}
                {parseFloat(valor || '0')
                  .toFixed(2)
                  .replace('.', ',')}
              </strong>
              . Deseja salvar este lançamento mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateWarning(false)}>
              Revisar Dados
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => executeSave(pendingPayload)}>
              Salvar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
