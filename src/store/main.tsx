import React, { createContext, useContext, useState } from 'react'
import { Project } from '@/types'

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p-1',
    name: 'Controle de Estoque v2',
    description: 'Migração de planilha legada de controle de galpão para sistema web.',
    progress: 40,
    status: 'Em Análise',
    updatedAt: '2023-10-25',
    entities: [
      {
        id: 'e-1',
        name: 'Produtos',
        fields: [
          { id: 'f-1', name: 'SKU', type: 'Texto', required: true, isUnique: true },
          { id: 'f-2', name: 'Nome', type: 'Texto', required: true },
          { id: 'f-3', name: 'Custo', type: 'Moeda', required: true },
          { id: 'f-4', name: 'Preço Venda', type: 'Moeda', required: true, formula: 'Custo * 1.5' },
          { id: 'f-5', name: 'Qtd Estoque', type: 'Número', required: true },
        ],
      },
      {
        id: 'e-2',
        name: 'Movimentações',
        fields: [
          { id: 'f-6', name: 'Data', type: 'Data', required: true },
          { id: 'f-7', name: 'Tipo', type: 'Enum', required: true },
          { id: 'f-8', name: 'Quantidade', type: 'Número', required: true },
        ],
      },
    ],
  },
  {
    id: 'p-2',
    name: 'Gestão de RH',
    description: 'Acompanhamento de férias e benefícios.',
    progress: 100,
    status: 'Pronto para Dev',
    updatedAt: '2023-11-02',
    entities: [
      {
        id: 'e-3',
        name: 'Funcionários',
        fields: [
          { id: 'f-9', name: 'Matrícula', type: 'Texto', required: true },
          { id: 'f-10', name: 'Nome Completo', type: 'Texto', required: true },
          { id: 'f-11', name: 'Ativo', type: 'Booleano', required: true },
        ],
      },
    ],
  },
]

interface AppContextType {
  projects: Project[]
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)

  const addProject = (project: Project) => {
    setProjects((prev) => [...prev, project])
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  return React.createElement(
    AppContext.Provider,
    { value: { projects, addProject, updateProject } },
    children,
  )
}

export function useAppStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppStore deve ser usado dentro de um AppProvider')
  }
  return context
}
