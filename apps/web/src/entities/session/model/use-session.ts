import { useContext } from 'react'
import { SessionContext } from './session-context'
import type { SessionContextValue } from '../types'

export const useSession = (): SessionContextValue => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('SessionProvider missing')
  return ctx
}
