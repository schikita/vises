import type { ReactNode } from 'react'
import type { ClientDetailDto } from '@vises/contracts'

export type ClientDetailRenderProps = {
  listPath: string
  applicationPath: string | null
  portalFormPath: string | null
  loading: boolean
  loadError: string
  detail: ClientDetailDto | null
  canDelete: boolean
  deletePending: boolean
  deleteError: string
  passportForm: ReactNode
  onDelete: () => void
}
