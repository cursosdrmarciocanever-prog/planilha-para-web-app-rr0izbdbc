import { useSyncExternalStore } from 'react'

type ExpenseModalState = {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

let state: ExpenseModalState = {
  isOpen: false,
  openModal: () => updateState({ isOpen: true }),
  closeModal: () => updateState({ isOpen: false }),
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function updateState(newState: Partial<ExpenseModalState>) {
  state = { ...state, ...newState }
  listeners.forEach((l) => l())
}

export function useExpenseModalStore(): ExpenseModalState
export function useExpenseModalStore<T>(selector: (state: ExpenseModalState) => T): T
export function useExpenseModalStore<T>(selector?: (state: ExpenseModalState) => T) {
  const currentState = useSyncExternalStore(subscribe, getSnapshot)
  return selector ? selector(currentState) : currentState
}

useExpenseModalStore.getState = getSnapshot
useExpenseModalStore.setState = updateState
useExpenseModalStore.subscribe = subscribe

export default useExpenseModalStore
