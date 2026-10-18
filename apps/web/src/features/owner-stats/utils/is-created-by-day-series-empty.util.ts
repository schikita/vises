import type { OwnerStatsCreatedDayPoint } from '../types'

/** True when every day in the series has zero apps and users. */
export const isCreatedByDaySeriesEmpty = (
  points: OwnerStatsCreatedDayPoint[],
): boolean =>
  points.length === 0 || points.every((p) => p.apps === 0 && p.users === 0)
