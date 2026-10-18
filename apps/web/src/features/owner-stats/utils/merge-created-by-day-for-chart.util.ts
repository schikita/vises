import type {
  CreatedByDayRow,
  OwnerStatsCreatedDayPoint,
} from '../types'

/** Merge apps/users day series into Recharts-friendly points with short labels. */
export const mergeCreatedByDayForChart = (
  apps: CreatedByDayRow[],
  users: CreatedByDayRow[],
): OwnerStatsCreatedDayPoint[] => {
  const usersByDate = new Map(users.map((row) => [row.date, row.count] as const))
  return apps.map((row) => {
    const [, month, day] = row.date.split('-')
    return {
      date: row.date,
      label: `${day}.${month}`,
      apps: row.count,
      users: usersByDate.get(row.date) ?? 0,
    }
  })
}
