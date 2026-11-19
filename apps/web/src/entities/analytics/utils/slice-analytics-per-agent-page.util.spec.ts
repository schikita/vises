import { describe, expect, it } from 'vitest'
import type { AnalyticsPerAgentDto } from '@vises/contracts'
import { sliceAnalyticsPerAgentPage } from './slice-analytics-per-agent-page.util'

const rows: AnalyticsPerAgentDto[] = [
  { agentId: 'a', totalApplications: 1, byStatus: [] },
  { agentId: 'b', totalApplications: 1, byStatus: [] },
  { agentId: 'c', totalApplications: 1, byStatus: [] },
]

describe('sliceAnalyticsPerAgentPage', (): void => {
  it('returns at most pageSize rows for page 1', (): void => {
    expect(sliceAnalyticsPerAgentPage(rows, 1, 2)).toEqual([rows[0], rows[1]])
  })

  it('returns the next page', (): void => {
    expect(sliceAnalyticsPerAgentPage(rows, 2, 2)).toEqual([rows[2]])
  })
})
