import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import { buildDayPickerBounds } from './build-day-picker-bounds.util'
import { DateRangePicker } from './DateRangePicker'

describe('DateRangePicker', (): void => {
  afterEach((): void => {
    cleanup()
    vi.useRealTimers()
  })

  it('navigates caption → year grid → month grid → day view (FE22)', async (): Promise<void> => {
    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    const user = userEvent.setup()

    render(
      <DateRangePicker
        from="2026-03-01"
        to="2026-03-15"
        onFromChange={onFromChange}
        onToChange={onToChange}
        ariaLabel="Select date range"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Select date range' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.querySelector('.vises-day-picker')).toBeInTheDocument()
    expect(document.querySelector('.rdp-dropdown')).not.toBeInTheDocument()
    expect(document.querySelector('select')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Select year, currently/i }),
    )
    expect(
      screen.getByRole('listbox', { name: 'Select year' }),
    ).toBeInTheDocument()
    expect(document.querySelector('.vises-day-picker')).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: '2025' }))
    expect(
      screen.getByRole('listbox', { name: 'Select month for 2025' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('listbox', { name: 'Select year' }),
    ).not.toBeInTheDocument()
    expect(document.querySelector('.vises-day-picker')).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Jun' }))
    expect(document.querySelector('.vises-day-picker')).toBeInTheDocument()
    expect(
      screen.queryByRole('listbox', { name: 'Select month for 2025' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Select year, currently June 2025/i,
      }),
    ).toBeInTheDocument()
    expect(document.querySelector('.rdp-dropdown')).not.toBeInTheDocument()
    expect(document.querySelector('select')).not.toBeInTheDocument()
  })

  it('selects a date range and shows continuous mid-range highlight (FE22)', async (): Promise<void> => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 3))

    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <DateRangePicker
        from=""
        to=""
        onFromChange={onFromChange}
        onToChange={onToChange}
        ariaLabel="Select date range"
      />,
    )

    expect(screen.getByRole('button', { name: 'Select date range' })).toHaveTextContent(
      'DD.MM.YYYY - DD.MM.YYYY',
    )

    await user.click(screen.getByRole('button', { name: 'Select date range' }))
    expect(
      screen.getByRole('button', { name: /Select year, currently November 2026/i }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /November 5(?:th)?, 2026/i }),
    )
    expect(onFromChange).toHaveBeenCalledWith('2026-11-05')

    rerender(
      <DateRangePicker
        from="2026-11-05"
        to=""
        onFromChange={onFromChange}
        onToChange={onToChange}
        ariaLabel="Select date range"
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /November 12(?:th)?, 2026/i }),
    )
    expect(onFromChange).toHaveBeenCalledWith('2026-11-05')
    expect(onToChange).toHaveBeenCalledWith('2026-11-12')

    rerender(
      <DateRangePicker
        from="2026-11-05"
        to="2026-11-12"
        onFromChange={onFromChange}
        onToChange={onToChange}
        ariaLabel="Select date range"
      />,
    )

    expect(screen.getByRole('button', { name: 'Select date range' })).toHaveTextContent(
      '05.11.2026 - 12.11.2026',
    )
    expect(document.querySelector('.rdp-range_middle')).toBeInTheDocument()
    expect(document.querySelector('.rdp-range_start')).toBeInTheDocument()
    expect(document.querySelector('.rdp-range_end')).toBeInTheDocument()
  })

  it('navigates year decades across CurrentYear−30 … CurrentYear+30 (FE22)', async (): Promise<void> => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 3))

    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    const user = userEvent.setup()
    const bounds = buildDayPickerBounds(new Date())
    const minYear = 1996
    const maxYear = 2056

    expect(bounds.startMonth.getFullYear()).toBe(minYear)
    expect(bounds.endMonth.getFullYear()).toBe(maxYear)

    render(
      <DateRangePicker
        from="2026-06-01"
        to="2026-06-15"
        onFromChange={onFromChange}
        onToChange={onToChange}
        ariaLabel="Select date range"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Select date range' }))
    await user.click(
      screen.getByRole('button', { name: /Select year, currently/i }),
    )

    const previous = screen.getByRole('button', { name: 'Previous' })
    const next = screen.getByRole('button', { name: 'Next' })

    while (!previous.hasAttribute('disabled')) {
      await user.click(previous)
    }

    expect(screen.getByRole('option', { name: String(minYear) })).toBeEnabled()
    expect(
      screen.getByRole('option', { name: String(minYear - 1) }),
    ).toBeDisabled()

    while (!next.hasAttribute('disabled')) {
      await user.click(next)
    }

    expect(screen.getByRole('option', { name: String(maxYear) })).toBeEnabled()
    expect(
      screen.getByRole('option', { name: String(maxYear + 1) }),
    ).toBeDisabled()

    await user.click(screen.getByRole('option', { name: String(maxYear) }))
    expect(
      screen.getByRole('listbox', { name: `Select month for ${maxYear}` }),
    ).toBeInTheDocument()
  })

  it('applies presets to draft from/to without leaving day view (FE22)', async (): Promise<void> => {
    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    const user = userEvent.setup()

    render(
      <DateRangePicker
        from=""
        to=""
        onFromChange={onFromChange}
        onToChange={onToChange}
        ariaLabel="Select date range"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Select date range' }))
    await user.click(screen.getByRole('button', { name: 'Last 7 days' }))
    expect(onFromChange).toHaveBeenCalled()
    expect(onToChange).toHaveBeenCalled()
    expect(document.querySelector('.vises-day-picker')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'This Month' }))
    expect(onFromChange).toHaveBeenCalledTimes(2)
    expect(onToChange).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole('button', { name: 'This Year' }))
    expect(onFromChange).toHaveBeenCalledTimes(3)
    expect(onToChange).toHaveBeenCalledTimes(3)
  })
})
