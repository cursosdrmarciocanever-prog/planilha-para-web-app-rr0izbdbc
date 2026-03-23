export interface Sala {
  id: string
  nome: string
  status: string
  taxa_hora: number
  taxa_dia: number
  horas_mes?: number
  dias_mes?: number
  created_at: string
}

export interface Paciente {
  id: string
  nome: string
}

export interface Ocupacao {
  id: string
  sala_id: string
  paciente_id: string | null
  horario_inicio: string
  horario_fim: string
  valor_cobrado: number
  created_at: string
  sala?: Sala
  paciente?: Paciente
}
