import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import { ANALYTICS_RANGE_MODE } from '../../constants'
import { AnalyticsDateRangeFilters } from './AnalyticsDateRangeFilters'

describe('AnalyticsDateRangeFilters', (): void => {
  beforeEach(async (): Promise<void> => {
    await i18n.changeLanguage('en')
  })

  afterEach((): void => {
    cleanup()
  })

  it('toggles to date-range mode and exposes from/to inputs (AC-12a)', async (): Promise<void> => {
    const onModeChange = vi.fn()
    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <AnalyticsDateRangeFilters
        mode={ANALYTICS_RANGE_MODE.Current}
        from=""
        to=""
        onModeChange={onModeChange}
        onFromChange={onFromChange}
        onToChange={onToChange}
      />,
    )

    expect(screen.queryByLabelText('From')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Date range' }))
    expect(onModeChange).toHaveBeenCalledWith(ANALYTICS_RANGE_MODE.Range)

    rerender(
      <AnalyticsDateRangeFilters
        mode={ANALYTICS_RANGE_MODE.Range}
        from=""
        to=""
        onModeChange={onModeChange}
        onFromChange={onFromChange}
        onToChange={onToChange}
      />,
    )

    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
  })
})
