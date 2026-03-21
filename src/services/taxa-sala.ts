import { supabase } from '@/lib/supabase/client'
import { Sala, Ocupacao, Paciente } from '@/types/taxa-sala'
import { logAction } from './audit'

export const getSalas = async () => {
  const { data, error } = await supabase.from('salas').select('*').order('nome')
  if (error) throw error
  return data as unknown as Sala[]
}

export const addSala = async (sala: Partial<Sala>) => {
  const { data, error } = await supabase.from('salas').insert(sala).select().single()
  if (error) throw error

  await logAction(`Criou sala: ${sala.nome}`, 'sala', data.id)
  return data as unknown as Sala
}

export const deleteSala = async (id: string) => {
  const { error } = await supabase.from('salas').delete().eq('id', id)
  if (error) throw error

  await logAction('Excluiu sala', 'sala', id)
}

export const getOcupacoes = async (startDate?: string, endDate?: string) => {
  let query = supabase
    .from('ocupacao_salas')
    .select(
      `
    *,
    sala:salas(id, nome, taxa_hora, taxa_dia),
    paciente:pacientes(id, nome)
  `,
    )
    .order('horario_inicio', { ascending: false })

  if (startDate) query = query.gte('horario_inicio', startDate)
  if (endDate) query = query.lte('horario_inicio', endDate)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as Ocupacao[]
}

export const addOcupacao = async (ocupacao: Partial<Ocupacao>) => {
  const { data, error } = await supabase.from('ocupacao_salas').insert(ocupacao).select().single()
  if (error) throw error

  await logAction('Registrou ocupação de sala', 'ocupacao', data.id)
  return data as unknown as Ocupacao
}

export const deleteOcupacao = async (id: string) => {
  const { error } = await supabase.from('ocupacao_salas').delete().eq('id', id)
  if (error) throw error

  await logAction('Excluiu registro de ocupação', 'ocupacao', id)
}

export const getPacientesSimples = async () => {
  const { data, error } = await supabase.from('pacientes').select('id, nome').order('nome')
  if (error) throw error
  return data as unknown as Paciente[]
}
