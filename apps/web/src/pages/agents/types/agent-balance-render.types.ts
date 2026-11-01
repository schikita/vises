import type { ReactNode } from 'react'

export type AgentBalanceRenderProps = {
  agentName: string
  agentLogin: string
  loading: boolean
  loadError: string
  currentBalance: string | null
  topUpForm: ReactNode
  adjustForm: ReactNode
  ledger: ReactNode
}
