import type { Status } from '@/entities/application'

export type AnalyticsStatusRow = {
  status: Status
  count: number
  percentage: string
}
