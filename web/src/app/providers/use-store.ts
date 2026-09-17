import { useContext } from 'react'
import { StoreContext } from './store-context'

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store missing')
  return ctx
}
