import type { ReactNode } from 'react'

export type BalanceRenderProps = {
  loading: boolean
  loadError: string
  currentBalance: string | null
  ledger: ReactNode
  ledgerPage: number
  ledgerPageSize: number
  ledgerTotal: number
  onLedgerPageChange: (page: number) => void
}
