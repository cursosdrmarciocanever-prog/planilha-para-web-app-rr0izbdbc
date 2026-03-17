import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type RegistroDiario = Database['public']['Tables']['registros_diarios']['Row']
export type InsertRegistroDiario = Database['public']['Tables']['registros_diarios']['Insert']

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
  return data as RegistroDiario[]
}

export const createRegistro = async (registro: InsertRegistroDiario) => {
  const { data, error } = await supabase
    .from('registros_diarios')
    .insert(registro)
    .select()
    .single()

  if (error) throw error
  return data as RegistroDiario
}
