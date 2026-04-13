import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Funcionario {
  id: string
  nome: string
  salario_base: number
  horas_mensais: number
  encargos_percentual: number
  beneficios_mensais: number
  setor: string
  receita_gerada: number
  meta_receita: number
  created_at?: string
}

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [fetching, setFetching] = useState(true)

  const fetchFuncionarios = useCallback(async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from('funcionarios' as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFuncionarios(data as Funcionario[])
    } else if (error) {
      console.error('Error fetching funcionarios:', error)
    }
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchFuncionarios()
  }, [fetchFuncionarios])

  const saveFuncionario = async (func: Partial<Funcionario>) => {
    if (func.id) {
      const { error } = await supabase
        .from('funcionarios' as any)
        .update(func)
        .eq('id', func.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('funcionarios' as any).insert([func])
      if (error) throw error
    }
    await fetchFuncionarios()
  }

  const deleteFuncionario = async (id: string) => {
    const { error } = await supabase
      .from('funcionarios' as any)
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchFuncionarios()
  }

  return { funcionarios, fetching, saveFuncionario, deleteFuncionario, refetch: fetchFuncionarios }
}
