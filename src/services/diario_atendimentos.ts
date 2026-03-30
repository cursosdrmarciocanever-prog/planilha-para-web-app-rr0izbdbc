import { supabase } from '@/lib/supabase/client'

export interface DiarioAtendimento {
  id: string
  data: string
  paciente_nome: string
  valor_consulta: number
  valor_procedimento: number
  forma_pagamento: string
  parcelas: number | null
  conta_recebimento?: string | null
  created_at?: string
  user_id?: string
}

export async function getDiarioAtendimentos(
  startDate?: Date,
  endDate?: Date,
  formaPagamento?: string,
  tipoServico?: string,
) {
  let query = supabase.from('diario_atendimentos').select('*')

  if (startDate) {
    query = query.gte('data', startDate.toISOString().split('T')[0])
  }
  if (endDate) {
    query = query.lte('data', endDate.toISOString().split('T')[0])
  }

  if (formaPagamento && formaPagamento !== 'Todos') {
    query = query.eq('forma_pagamento', formaPagamento)
  }

  if (tipoServico && tipoServico !== 'Todos') {
    if (tipoServico === 'Consulta') {
      query = query.gt('valor_consulta', 0)
    } else if (tipoServico === 'Procedimento') {
      query = query.gt('valor_procedimento', 0)
    }
  }

  query = query.order('data', { ascending: false }).order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data as DiarioAtendimento[]
}

export async function deleteDiarioAtendimento(id: string) {
  const { error } = await supabase.from('diario_atendimentos').delete().eq('id', id)
  if (error) throw error
}

export async function createDiarioAtendimento(payload: Partial<DiarioAtendimento>) {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('diario_atendimentos')
    .insert([{ ...payload, user_id: userData.user?.id }])
    .select()
    .single()
  if (error) throw error
  return data
}
