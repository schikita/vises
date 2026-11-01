import { useContext } from 'react'
import { StoreContext } from './store-context'
import type { Store } from '../types'

export const useStore = (): Store => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store missing')
  return ctx
}
