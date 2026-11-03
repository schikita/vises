import {
  DATE_RANGE_PICKER_GRID_CELL_ACTIVE_CLASS,
  DATE_RANGE_PICKER_GRID_CELL_CLASS,
  DATE_RANGE_PICKER_GRID_CELL_DISABLED_CLASS,
  DATE_RANGE_PICKER_YEAR_GRID_CLASS,
} from './date-range-picker.constants'
import type { DateRangePickerYearGridProps } from './date-range-picker.types'

export const DateRangePickerYearGrid = (
  props: DateRangePickerYearGridProps,
): React.ReactElement => {
  const { years, selectedYear, minYear, maxYear, onSelectYear } = props

  return (
    <div
      className={DATE_RANGE_PICKER_YEAR_GRID_CLASS}
      role="listbox"
      aria-label="Select year"
    >
      {years.map((year: number): React.ReactElement => {
        const disabled = year < minYear || year > maxYear
        const active = year === selectedYear
        const className = [
          DATE_RANGE_PICKER_GRID_CELL_CLASS,
          active ? DATE_RANGE_PICKER_GRID_CELL_ACTIVE_CLASS : '',
          disabled ? DATE_RANGE_PICKER_GRID_CELL_DISABLED_CLASS : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={year}
            type="button"
            role="option"
            aria-selected={active}
            className={className}
            disabled={disabled}
            onClick={(): void => {
              onSelectYear(year)
            }}
          >
            {year}
          </button>
        )
      })}
    </div>
  )
}
