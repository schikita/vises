import type { ApplicationStatusHistoryDto } from '@vises/contracts'

export type ApplicationStatusHistoryTimelineProps = {
  items: ApplicationStatusHistoryDto[]
  loading: boolean
  error: string
  emptyTitle: string
  emptyText: string
  loadingTitle: string
  loadingText: string
}
