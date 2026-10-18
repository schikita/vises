import { statusLabel } from '@/entities/application'
import type { Status } from '@/entities/application'
import type { AppsByStatusRow, OwnerStatsStatusSlice } from '../types'

/** Map API status buckets to Russian labels for the pie chart. */
export const mapAppsByStatusForChart = (
  rows: AppsByStatusRow[],
): OwnerStatsStatusSlice[] =>
  rows
    .filter((row) => row.count > 0)
    .map((row) => ({
      status: row.status,
      label: statusLabel(row.status as Status),
      count: row.count,
    }))
