import type { UserListItem } from '@/entities/user'

export type AgentsRenderProps = {
  agents: UserListItem[]
  loading: boolean
  listError: string
  notice: string
  empty: boolean
  total: number
  page: number
  pageSize: number
  q: string
  onQueryChange: (value: string) => void
  onPageChange: (page: number) => void
}
