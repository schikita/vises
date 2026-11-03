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

  it('toggles to date-range mode and exposes range picker + Apply (DEC-P10 / FE19)', async (): Promise<void> => {
    const onModeChange = vi.fn()
    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    const onApply = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <AnalyticsDateRangeFilters
        mode={ANALYTICS_RANGE_MODE.Current}
        from=""
        to=""
        onModeChange={onModeChange}
        onFromChange={onFromChange}
        onToChange={onToChange}
        onApply={onApply}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Select analytics date range' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('From')).not.toBeInTheDocument()
    expect(document.querySelector('input[type="date"]')).not.toBeInTheDocument()

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
        onApply={onApply}
      />,
    )

    const rangeTrigger = screen.getByRole('button', {
      name: 'Select analytics date range',
    })
    expect(rangeTrigger).toBeInTheDocument()
    expect(document.querySelector('input[type="date"]')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()

    await user.click(rangeTrigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Last 7 days' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'This Month' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'This Year' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Last 7 days' }))
    expect(onFromChange).toHaveBeenCalled()
    expect(onToChange).toHaveBeenCalled()
    expect(onApply).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onApply).toHaveBeenCalledTimes(1)
  })
})
