import { createContext } from 'react'
import type { Store } from '../types'

export const StoreContext = createContext<Store | null>(null)
