import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AnalyticsStatusBucketDto } from '@vises/contracts'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen } from '@/shared/testing'
import { AnalyticsStatusBucketsTable } from './AnalyticsStatusBucketsTable'

const buckets: AnalyticsStatusBucketDto[] = [
  { status: 'draft', count: 1, percentage: '16.67' },
  { status: 'filling', count: 2, percentage: '33.33' },
  { status: 'declined', count: 0, percentage: '0.00' },
  { status: 'booked', count: 2, percentage: '33.33' },
  { status: 'ready_for_appointment', count: 1, percentage: '16.67' },
]

describe('AnalyticsStatusBucketsTable', (): void => {
  beforeEach(async (): Promise<void> => {
    await i18n.changeLanguage('en')
  })

  afterEach((): void => {
    cleanup()
  })

  it('renders API percentage decimal strings as-is (AC-12)', (): void => {
    render(
      <AnalyticsStatusBucketsTable
        buckets={buckets}
        emptyTitle="Empty"
        emptyText="No rows"
      />,
    )

    expect(screen.getByTestId('analytics-percentage-filling').textContent).toBe(
      '33.33%',
    )
    expect(screen.getByTestId('analytics-percentage-booked').textContent).toBe(
      '33.33%',
    )
    expect(screen.getByTestId('analytics-percentage-draft').textContent).toBe(
      '16.67%',
    )
    expect(
      screen.getByTestId('analytics-percentage-declined').textContent,
    ).toBe('0.00%')
  })
})
