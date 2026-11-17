import type { ReactElement } from 'react'
import {
  DATE_RANGE_PICKER_GRID_CELL_ACTIVE_CLASS,
  DATE_RANGE_PICKER_GRID_CELL_CLASS,
  DATE_RANGE_PICKER_GRID_CELL_DISABLED_CLASS,
  DATE_RANGE_PICKER_MONTH_GRID_CLASS,
} from './date-range-picker.constants'
import type {
  DateRangePickerMonthGridProps,
  DateRangePickerMonthItem,
} from './date-range-picker.types'
import { isMonthWithinBounds } from './is-month-within-bounds.util'

export const DateRangePickerMonthGrid = (
  props: DateRangePickerMonthGridProps,
): ReactElement => {
  const {
    year,
    months,
    selectedMonthIndex,
    startMonth,
    endMonth,
    onSelectMonth,
  } = props

  return (
    <div
      className={DATE_RANGE_PICKER_MONTH_GRID_CLASS}
      role="listbox"
      aria-label={`Select month for ${year}`}
    >
      {months.map((month: DateRangePickerMonthItem): ReactElement => {
        const disabled = !isMonthWithinBounds(
          month.date,
          startMonth,
          endMonth,
        )
        const active = month.monthIndex === selectedMonthIndex
        const className = [
          DATE_RANGE_PICKER_GRID_CELL_CLASS,
          active ? DATE_RANGE_PICKER_GRID_CELL_ACTIVE_CLASS : '',
          disabled ? DATE_RANGE_PICKER_GRID_CELL_DISABLED_CLASS : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={month.monthIndex}
            type="button"
            role="option"
            aria-selected={active}
            className={className}
            disabled={disabled}
            onClick={(): void => {
              onSelectMonth(month.monthIndex)
            }}
          >
            {month.label}
          </button>
        )
      })}
    </div>
  )
}
