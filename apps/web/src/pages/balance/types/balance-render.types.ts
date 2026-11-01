import type { ReactNode } from 'react'

export type BalanceRenderProps = {
  loading: boolean
  loadError: string
  currentBalance: string | null
  ledger: ReactNode
}
