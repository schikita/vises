import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/shared/ui'
import { OWNER_STATS_COPY, OWNER_STATS_STATUS_COLORS } from '../../constants'
import type {
  OwnerStatsCreatedDayPoint,
  OwnerStatsStatusSlice,
} from '../../types'
import { formatOwnerStatsRangeHint } from '../../utils'
type OwnerStatsChartsRenderProps = {
  statusSlices: OwnerStatsStatusSlice[]
  createdPoints: OwnerStatsCreatedDayPoint[]
  createdEmpty: boolean
  rangeDays: number
  loading: boolean
  error: string
}

export const OwnerStatsChartsRender = ({
  statusSlices,
  createdPoints,
  createdEmpty,
  rangeDays,
  loading,
  error,
}: OwnerStatsChartsRenderProps) => {
  if (loading) {
    return (
      <p className="mt-5 text-sm text-muted" role="status">
        {OWNER_STATS_COPY.loading}
      </p>
    )
  }

  if (error) {
    return (
      <p className="mt-5 text-sm font-semibold text-clay" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <Card>
        <p className="font-bold">{OWNER_STATS_COPY.statusTitle}</p>
        {statusSlices.length === 0 ? (
          <p className="mt-6 text-sm text-muted">{OWNER_STATS_COPY.emptyStatus}</p>
        ) : (
          <div className="mt-2 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusSlices}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {statusSlices.map((slice, index) => (
                    <Cell
                      key={slice.status}
                      fill={
                        OWNER_STATS_STATUS_COLORS[
                          index % OWNER_STATS_STATUS_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [String(value ?? 0), 'Кол-во']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-bold">{OWNER_STATS_COPY.createdTitle}</p>
          <p className="text-xs text-muted">
            {formatOwnerStatsRangeHint(rangeDays)}
          </p>
        </div>
        {createdEmpty ? (
          <p className="mt-6 text-sm text-muted">{OWNER_STATS_COPY.emptyCreated}</p>
        ) : (
          <div className="mt-2 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={createdPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8e0db" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#5c6b64' }}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#5c6b64' }}
                  width={32}
                />
                <Tooltip
                  labelFormatter={(_, payload) => {
                    const point = payload?.[0]?.payload as
                      | OwnerStatsCreatedDayPoint
                      | undefined
                    return point?.date ?? ''
                  }}
                />
                <Legend />
                <Bar
                  dataKey="apps"
                  name={OWNER_STATS_COPY.appsSeries}
                  fill="#163a32"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="users"
                  name={OWNER_STATS_COPY.usersSeries}
                  fill="#2f7a64"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  )
}
