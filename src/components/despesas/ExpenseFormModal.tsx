import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { format, parseISO, addMonths, setDate } from 'date-fns'
import { useExpenseModalStore } from '@/stores/use-expense-modal'

const CATEGORIAS = ['Fixas', 'Variáveis', 'Pessoal', 'Impostos', 'Marketing']

export function ExpenseFormModal() {
  const { isOpen, closeModal, editId, editType, triggerRefresh } = useExpenseModalStore()
  const { user } = useAuth()
  const { toast } = useToast()

  const [dataVencimento, setDataVencimento] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [subcategoria, setSubcategoria] = useState('none')
  const [novaSubcategoria, setNovaSubcategoria] = useState('')
  const [isCreatingSubcategoria, setIsCreatingSubcategoria] = useState(false)
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('Pendente')
  const [contaPagamento, setContaPagamento] = useState('Unicred')
  const [recorrencia, setRecorrencia] = useState('Única')
  const [parcelas, setParcelas] = useState('2')
  const [subcategorias, setSubcategorias] = useState<{ id: string; nome: string }[]>([])
  const [isDraftLoading, setIsDraftLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('subcategorias_despesas' as any)
      .select('*')
      .order('nome')
      .then(({ data }) => {
        if (data) setSubcategorias(data)
      })
  }, [])

  const saveDraft = useCallback(async () => {
    if (!user || editId || isDraftLoading) return
    const draft = {
      dataVencimento,
      descricao,
      categoria,
      subcategoria,
      isCreatingSubcategoria,
      novaSubcategoria,
      valor,
      status,
      contaPagamento,
      recorrencia,
      parcelas,
    }
    await supabase
      .from('form_drafts' as any)
      .upsert(
        { user_id: user.id, form_id: 'nova_despesa', form_data: draft },
        { onConflict: 'user_id,form_id' },
      )
  }, [
    user,
    editId,
    dataVencimento,
    descricao,
    categoria,
    subcategoria,
    isCreatingSubcategoria,
    novaSubcategoria,
    valor,
    status,
    contaPagamento,
    recorrencia,
    parcelas,
    isDraftLoading,
  ])

  useEffect(() => {
    if (!isOpen || editId || isDraftLoading) return
    const timer = setTimeout(() => saveDraft(), 1000)
    return () => clearTimeout(timer)
  }, [saveDraft, isOpen, editId, isDraftLoading])

  useEffect(() => {
    if (!isOpen) return
    if (editId) {
      const table = editType === 'conta_fixa' ? 'contas_fixas' : 'despesas'
      supabase
        .from(table)
        .select('*')
        .eq('id', editId)
        .single()
        .then(({ data }) => {
          if (data) {
            setDataVencimento(data.data_vencimento || '')
            setDescricao(data.descricao || '')
            setCategoria(data.categoria || '')
            setSubcategoria(data.subcategoria || 'none')
            setValor(data.valor?.toString() || '')
            setStatus(data.status || 'Pendente')
            setContaPagamento(data.conta_pagamento || 'Unicred')
            setRecorrencia(editType === 'conta_fixa' ? 'Recorrente' : 'Única')
          }
        })
    } else {
      setIsDraftLoading(true)
      supabase
        .from('form_drafts' as any)
        .select('form_data')
        .eq('user_id', user?.id)
        .eq('form_id', 'nova_despesa')
        .maybeSingle()
        .then(({ data }) => {
          if (data?.form_data) {
            const d = data.form_data
            setDataVencimento(d.dataVencimento || '')
            setDescricao(d.descricao || '')
            setCategoria(d.categoria || '')
            setSubcategoria(d.subcategoria || 'none')
            setIsCreatingSubcategoria(d.isCreatingSubcategoria || false)
            setNovaSubcategoria(d.novaSubcategoria || '')
            setValor(d.valor || '')
            setStatus(d.status || 'Pendente')
            setContaPagamento(d.contaPagamento || 'Unicred')
            setRecorrencia(d.recorrencia || 'Única')
            setParcelas(d.parcelas || '2')
          } else {
            setDataVencimento(format(new Date(), 'yyyy-MM-dd'))
            setDescricao('')
            setCategoria('')
            setSubcategoria('none')
            setIsCreatingSubcategoria(false)
            setNovaSubcategoria('')
            setValor('')
            setStatus('Pendente')
            setContaPagamento('Unicred')
            setRecorrencia('Única')
            setParcelas('2')
          }
          setIsDraftLoading(false)
        })
    }
  }, [isOpen, editId, editType, user])

  useEffect(() => {
    if (!isOpen || isDraftLoading) return
    if (contaPagamento === 'Cartão de Crédito Unicred') {
      setDataVencimento(
        format(setDate(dataVencimento ? parseISO(dataVencimento) : new Date(), 10), 'yyyy-MM-dd'),
      )
    } else if (contaPagamento === 'Cartão de Crédito Sicoob') {
      setDataVencimento(
        format(setDate(dataVencimento ? parseISO(dataVencimento) : new Date(), 19), 'yyyy-MM-dd'),
      )
    }
  }, [contaPagamento, isOpen, isDraftLoading])

  const handleDelete = async () => {
    if (!editId || !confirm('Tem certeza que deseja excluir?')) return
    const table = editType === 'conta_fixa' ? 'contas_fixas' : 'despesas'
    await supabase.from(table).delete().eq('id', editId)
    toast({ title: 'Sucesso', description: 'Registro excluído.' })
    triggerRefresh()
    closeModal()
  }

  const handleSave = async () => {
    if (!dataVencimento || !descricao || !categoria || !valor) {
      return toast({
        title: 'Atenção',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      })
    }
    let finalSubcategoria = subcategoria
    if (isCreatingSubcategoria && novaSubcategoria.trim()) {
      const { data } = await supabase
        .from('subcategorias_despesas' as any)
        .insert({ nome: novaSubcategoria.trim(), user_id: user?.id })
        .select()
        .single()
      if (data) {
        finalSubcategoria = data.nome
        setSubcategorias((p) => [...p, data])
      }
    } else if (isCreatingSubcategoria) {
      finalSubcategoria = 'none'
    }

    const payloadBase: any = {
      descricao,
      categoria,
      subcategoria: finalSubcategoria === 'none' ? null : finalSubcategoria,
      conta_pagamento: contaPagamento,
      status,
      valor: parseFloat(valor),
    }

    if (!editId && recorrencia === 'Parcelada') {
      const numParcelas = parseInt(parcelas)
      if (isNaN(numParcelas) || numParcelas < 2)
        return toast({
          title: 'Atenção',
          description: 'Número de parcelas inválido.',
          variant: 'destructive',
        })
      const inserts = Array.from({ length: numParcelas }).map((_, i) => ({
        ...payloadBase,
        valor: parseFloat(valor),
        descricao: `${descricao} (${i + 1}/${numParcelas})`,
        data_vencimento: format(addMonths(parseISO(dataVencimento), i), 'yyyy-MM-dd'),
        user_id: user?.id,
      }))
      await supabase.from('despesas').insert(inserts)
    } else if (!editId && recorrencia === 'Recorrente') {
      await supabase.from('contas_fixas').insert([
        {
          ...payloadBase,
          data_vencimento: dataVencimento,
          frequencia: 'Mensal',
          usuario_id: user?.id,
        },
      ])
    } else {
      const table = editId ? (editType === 'conta_fixa' ? 'contas_fixas' : 'despesas') : 'despesas'
      const finalPayload = { ...payloadBase, data_vencimento: dataVencimento }
      if (table === 'contas_fixas') {
        finalPayload.usuario_id = user?.id
        if (!editId) finalPayload.frequencia = 'Mensal'
      } else {
        finalPayload.user_id = user?.id
      }
      if (editId) await supabase.from(table).update(finalPayload).eq('id', editId)
      else await supabase.from(table).insert([finalPayload])
    }

    if (!editId)
      await supabase
        .from('form_drafts' as any)
        .delete()
        .eq('user_id', user?.id)
        .eq('form_id', 'nova_despesa')
    toast({ title: 'Sucesso', description: 'Registro salvo com sucesso.' })
    triggerRefresh()
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{editId ? 'Editar' : 'Nova'} Transação</DialogTitle>
          <DialogDescription>
            Registre uma entrada ou saída na conta {contaPagamento}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="font-semibold text-foreground">Descrição</Label>
            <Input
              placeholder="Ex: Aluguel, Fornecedor..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-secondary/20 h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">
                {recorrencia === 'Parcelada' ? 'Valor da Parcela (R$)' : 'Valor (R$)'}
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="bg-secondary/20 font-medium h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Data Inicial</Label>
              <Input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="bg-secondary/20 h-11"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Tipo</Label>
              <Select value="Saída" disabled>
                <SelectTrigger className="bg-secondary/20 h-11 opacity-70">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saída">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Recorrência</Label>
              <Select value={recorrencia} onValueChange={setRecorrencia} disabled={!!editId}>
                <SelectTrigger className="border-primary text-primary font-medium h-11">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Única">Única</SelectItem>
                  <SelectItem value="Recorrente">Recorrente</SelectItem>
                  <SelectItem value="Parcelada">Parcelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground flex justify-between">
                Categoria
              </Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="bg-secondary/20 h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground flex justify-between">
                Subcategoria
              </Label>
              {!isCreatingSubcategoria ? (
                <Select
                  value={subcategoria}
                  onValueChange={(v) =>
                    v === 'new'
                      ? (setIsCreatingSubcategoria(true), setSubcategoria('none'))
                      : setSubcategoria(v)
                  }
                >
                  <SelectTrigger className="bg-secondary/20 h-11">
                    <SelectValue placeholder="Selecione ou crie..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {subcategorias.map((sub) => (
                      <SelectItem key={sub.id} value={sub.nome}>
                        {sub.nome}
                      </SelectItem>
                    ))}
                    <SelectItem value="new" className="font-semibold text-primary">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Nova Subcategoria...
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da subcategoria"
                    value={novaSubcategoria}
                    onChange={(e) => setNovaSubcategoria(e.target.value)}
                    className="bg-secondary/20 h-11"
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => {
                      setIsCreatingSubcategoria(false)
                      setNovaSubcategoria('')
                      setSubcategoria('none')
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recorrencia === 'Parcelada' && !editId && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label className="font-semibold text-foreground">Quantidade de Parcelas</Label>
                <Input
                  type="number"
                  min="2"
                  max="120"
                  placeholder="2"
                  value={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                  className="bg-secondary/20 h-11 border-primary"
                />
              </div>
            )}
            {recorrencia !== 'Parcelada' && (
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-secondary/20 h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Conta / Cartão</Label>
              <Select value={contaPagamento} onValueChange={setContaPagamento}>
                <SelectTrigger className="bg-secondary/20 h-11">
                  <SelectValue placeholder="Selecione a conta..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unicred">Conta Unicred</SelectItem>
                  <SelectItem value="Sicoob">Conta Sicoob</SelectItem>
                  <SelectItem value="ESPÉCIE">Conta ESPÉCIE</SelectItem>
                  <SelectItem value="Cartão de Crédito Unicred">Cartão de Créd. Unicred</SelectItem>
                  <SelectItem value="Cartão de Crédito Sicoob">Cartão de Créd. Sicoob</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 mt-2 border-t border-border/40">
            {editId && (
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-11"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Salvar Transação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
