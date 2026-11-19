import type { ReactNode } from 'react'
import type { ClientListDto } from '@vises/contracts'
import type {
  ClientsListSortBy,
  ClientsListSortDir,
} from '@/entities/client'

export type ClientsRenderProps = {
  items: ClientListDto[]
  loading: boolean
  listError: string
  notice: string
  total: number
  page: number
  pageSize: number
  search: string
  sortBy: ClientsListSortBy
  sortDir: ClientsListSortDir
  showAgentColumn: boolean
  canCreate: boolean
  createOpen: boolean
  createForm: ReactNode
  onOpenCreate: () => void
  onCloseCreate: () => void
  onSearchChange: (value: string) => void
  onSortChange: (sortBy: ClientsListSortBy) => void
  onPageChange: (page: number) => void
  onRowActivate: (clientId: string) => void
}
