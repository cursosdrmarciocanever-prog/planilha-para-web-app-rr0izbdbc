export type FieldType = 'Texto' | 'Número' | 'Data' | 'Moeda' | 'Enum' | 'Booleano'

export interface Field {
  id: string
  name: string
  type: FieldType
  formula?: string
  required: boolean
  isUnique?: boolean
}

export interface Entity {
  id: string
  name: string
  fields: Field[]
}

export interface Project {
  id: string
  name: string
  description: string
  progress: number
  status: 'Em Análise' | 'Documentado' | 'Pronto para Dev'
  updatedAt: string
  entities: Entity[]
}
