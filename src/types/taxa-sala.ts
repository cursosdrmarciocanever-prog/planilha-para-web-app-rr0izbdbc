export interface Sala {
  id: number
  nome: string
  taxa_hora: number
  taxa_dia: number
  created_at: string
}

export interface Paciente {
  id: string
  nome: string
}

export interface Ocupacao {
  id: number
  sala_id: number
  paciente_id: string | null
  data_inicio: string
  data_fim: string
  valor_cobrado: number
  created_at: string
  sala?: Sala
  paciente?: Paciente
}
