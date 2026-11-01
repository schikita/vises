import type { ReactNode } from 'react'

export type SessionProviderProps = {
  children: ReactNode
  /** AC-18a: clear TanStack Query (and any other server cache) on session change. */
  onSessionChange?: () => void
}
