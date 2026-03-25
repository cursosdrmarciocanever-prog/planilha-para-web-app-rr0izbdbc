import { supabase } from '@/lib/supabase/client'
import { logAction } from './audit'

export interface DiarioAtendimento {
  id: string
  data: string
  paciente_nome: string
  valor_consulta: number
  valor_procedimento: number
  forma_pagamento: string
  created_at: string
}

export type InsertDiarioAtendimento = Partial<Omit<DiarioAtendimento, 'id' | 'created_at'>>

export const getDiarioAtendimentos = async (
  startDate?: Date,
  endDate?: Date,
  formaPagamento?: string,
  tipoServico?: string,
) => {
  let query = supabase
    .from('diario_atendimentos')
    .select('*')
    .order('data', { ascending: false })
    .order('created_at', { ascending: false })

  if (startDate) {
    const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
    query = query.gte('data', startStr)
  }

  if (endDate) {
    const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
    query = query.lte('data', endStr)
  }

  if (formaPagamento && formaPagamento !== 'Todos') {
    query = query.eq('forma_pagamento', formaPagamento)
  }

  const { data, error } = await query
  if (error) throw error

  let result = data as unknown as DiarioAtendimento[]

  if (tipoServico && tipoServico !== 'Todos') {
    if (tipoServico === 'Consulta') {
      result = result.filter((r) => r.valor_consulta > 0)
    } else if (tipoServico === 'Procedimento') {
      result = result.filter((r) => r.valor_procedimento > 0)
    }
  }

  return result
}

export const createDiarioAtendimento = async (registro: InsertDiarioAtendimento) => {
  const { data: userData } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('diario_atendimentos')
    .insert({ ...registro, user_id: userData?.user?.id })
    .select()
    .single()

  if (error) throw error

  await logAction(
    `Cadastrou atendimento diário para ${registro.paciente_nome}`,
    'registro_diario',
    data.id,
  )
  return data as unknown as DiarioAtendimento
}

export const deleteDiarioAtendimento = async (id: string) => {
  const { error } = await supabase.from('diario_atendimentos').delete().eq('id', id)
  if (error) throw error

  await logAction(`Excluiu atendimento diário ${id}`, 'registro_diario', id)
}
