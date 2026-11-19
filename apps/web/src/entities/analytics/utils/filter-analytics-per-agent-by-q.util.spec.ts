import { describe, expect, it } from 'vitest'
import type { AnalyticsPerAgentDto } from '@vises/contracts'
import { filterAnalyticsPerAgentByQ } from './filter-analytics-per-agent-by-q.util'

const rows: AnalyticsPerAgentDto[] = [
  { agentId: 'agent-alice', totalApplications: 1, byStatus: [] },
  { agentId: 'agent-bob', totalApplications: 2, byStatus: [] },
]

describe('filterAnalyticsPerAgentByQ', (): void => {
  it('returns all rows when q is blank', (): void => {
    expect(filterAnalyticsPerAgentByQ(rows, '  ')).toEqual(rows)
  })

  it('filters by case-insensitive agentId substring', (): void => {
    expect(filterAnalyticsPerAgentByQ(rows, 'BOB')).toEqual([rows[1]])
  })
})
