import { supabase } from '@/lib/supabase/client'

export interface DiarioAtendimento {
  id: string
  data: string
  paciente_nome: string
  valor_consulta: number
  valor_procedimento: number
  forma_pagamento: string
  parcelas?: number | null
  created_at?: string | null
  user_id?: string | null
}

export async function getDiarioAtendimentos(
  startDate?: Date,
  endDate?: Date,
  formaPagamento?: string,
  tipoServico?: string,
): Promise<DiarioAtendimento[]> {
  const { data: userData } = await supabase.auth.getUser()

  let query = supabase
    .from('diario_atendimentos')
    .select('*')
    .eq('user_id', userData.user?.id)
    .order('data', { ascending: false })

  if (startDate) {
    const startStr = startDate.toISOString().split('T')[0]
    query = query.gte('data', startStr)
  }
  if (endDate) {
    const endStr = endDate.toISOString().split('T')[0]
    query = query.lte('data', endStr)
  }
  if (formaPagamento && formaPagamento !== 'Todos') {
    query = query.eq('forma_pagamento', formaPagamento)
  }

  const { data, error } = await query

  if (error) throw error

  let filteredData = data || []

  if (tipoServico && tipoServico !== 'Todos') {
    if (tipoServico === 'Consulta') {
      filteredData = filteredData.filter((r) => (r.valor_consulta || 0) > 0)
    } else if (tipoServico === 'Procedimento') {
      filteredData = filteredData.filter((r) => (r.valor_procedimento || 0) > 0)
    }
  }

  return filteredData as DiarioAtendimento[]
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

export async function deleteDiarioAtendimento(id: string) {
  const { error } = await supabase.from('diario_atendimentos').delete().eq('id', id)
  if (error) throw error
}
