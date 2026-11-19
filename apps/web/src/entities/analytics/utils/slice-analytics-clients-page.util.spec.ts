import { describe, expect, it } from 'vitest'
import type { AnalyticsClientsPerAgentDto } from '@vises/contracts'
import { ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE } from '../constants'
import { sliceAnalyticsClientsPage } from './slice-analytics-clients-page.util'

const buildRows = (count: number): AnalyticsClientsPerAgentDto[] =>
  Array.from({ length: count }, (_, index): AnalyticsClientsPerAgentDto => ({
    agentId: `agent-${index + 1}`,
    count: index + 1,
    percentage: '0%',
    balance: '0.00',
    registered: index + 1,
    paid: 0,
    paidAmount: '0.00',
  }))

describe('sliceAnalyticsClientsPage', (): void => {
  it('uses page size 5 for clients-per-agent (FE24)', (): void => {
    expect(ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE).toBe(5)
  })

  it('returns at most pageSize rows for page 1', (): void => {
    const rows = buildRows(19)
    const page = sliceAnalyticsClientsPage(
      rows,
      1,
      ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE,
    )
    expect(page).toHaveLength(5)
    expect(page[0]?.agentId).toBe('agent-1')
    expect(page[4]?.agentId).toBe('agent-5')
  })

  it('advances the window on Next page', (): void => {
    const rows = buildRows(19)
    const page = sliceAnalyticsClientsPage(
      rows,
      2,
      ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE,
    )
    expect(page).toHaveLength(5)
    expect(page[0]?.agentId).toBe('agent-6')
    expect(page[4]?.agentId).toBe('agent-10')
  })
})
