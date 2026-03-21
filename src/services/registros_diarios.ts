import { supabase } from '@/lib/supabase/client'
import { logAction } from './audit'

export interface RegistroDiario {
  id: string
  data: string
  conteudo?: string
  autor_id?: string
  faturamento_total: number
  total_consultas: number
  total_servicos: number
  bilheteria: number
  created_at: string
}

export type InsertRegistroDiario = Partial<Omit<RegistroDiario, 'id' | 'created_at'>>

export const getRegistros = async (startDate?: Date, endDate?: Date) => {
  let query = supabase.from('registros_diarios').select('*').order('data', { ascending: false })

  if (startDate) {
    const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
    query = query.gte('data', startStr)
  }

  if (endDate) {
    const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
    query = query.lte('data', endStr)
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as RegistroDiario[]
}

export const createRegistro = async (registro: InsertRegistroDiario) => {
  const { data, error } = await supabase
    .from('registros_diarios')
    .insert(registro)
    .select()
    .single()

  if (error) throw error

  await logAction(`Criou registro diário para data ${registro.data}`, 'registro_diario', data.id)
  return data as unknown as RegistroDiario
}

export const updateRegistro = async (id: string, registro: Partial<InsertRegistroDiario>) => {
  const { data, error } = await supabase
    .from('registros_diarios')
    .update(registro)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logAction(`Atualizou registro diário ${id}`, 'registro_diario', id)
  return data as unknown as RegistroDiario
}

export const deleteRegistro = async (id: string) => {
  const { error } = await supabase.from('registros_diarios').delete().eq('id', id)
  if (error) throw error

  await logAction(`Excluiu registro diário ${id}`, 'registro_diario', id)
}
