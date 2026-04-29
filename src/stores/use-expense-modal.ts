import { create } from 'zustand'

interface ExpenseModalState {
  isOpen: boolean
  editId: string | null
  editType: 'despesa' | 'conta_fixa'
  openModal: (editId?: string | null, editType?: 'despesa' | 'conta_fixa') => void
  closeModal: () => void
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useExpenseModalStore = create<ExpenseModalState>((set) => ({
  isOpen: false,
  editId: null,
  editType: 'despesa',
  openModal: (editId = null, editType = 'despesa') => set({ isOpen: true, editId, editType }),
  closeModal: () => set({ isOpen: false, editId: null }),
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}))
