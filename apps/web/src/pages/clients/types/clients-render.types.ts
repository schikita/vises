import type { ReactNode } from 'react'
import type { ClientListDto } from '@vises/contracts'

export type ClientsRenderProps = {
  items: ClientListDto[]
  loading: boolean
  listError: string
  notice: string
  detailBasePath: string
  canCreate: boolean
  createOpen: boolean
  createForm: ReactNode
  onOpenCreate: () => void
  onCloseCreate: () => void
}
