import { useState, type ReactElement } from 'react'
import { addMonths, addYears } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import { buildMonthGridItems } from './build-month-grid-items.util'
import { buildYearGridYears } from './build-year-grid-years.util'
import { buildYearPageStart } from './build-year-page-start.util'
import { clampDisplayMonth } from './clamp-display-month.util'
import {
  DATE_RANGE_PICKER_CALENDAR_CLASS,
  DATE_RANGE_PICKER_ROOT_CLASS,
  DATE_RANGE_PICKER_VIEW_MODE,
  DATE_RANGE_PICKER_YEAR_PAGE_SIZE,
} from './date-range-picker.constants'
import type {
  DateRangePickerCalendarProps,
  DateRangePickerViewMode,
} from './date-range-picker.types'
import { DateRangePickerHeader } from './DateRangePickerHeader'
import { DateRangePickerHiddenCaption } from './DateRangePickerHiddenCaption'
import { DateRangePickerMonthGrid } from './DateRangePickerMonthGrid'
import { DateRangePickerYearGrid } from './DateRangePickerYearGrid'
import { isMonthWithinBounds } from './is-month-within-bounds.util'

export const DateRangePickerCalendar = (
  props: DateRangePickerCalendarProps,
): ReactElement => {
  const {
    selected,
    onSelect,
    initialMonth,
    bounds,
    disabled,
    ariaLabel,
  } = props
  const [displayMonth, setDisplayMonth] = useState<Date>(() =>
    clampDisplayMonth(initialMonth, bounds.startMonth, bounds.endMonth),
  )
  const [viewMode, setViewMode] = useState<DateRangePickerViewMode>(
    DATE_RANGE_PICKER_VIEW_MODE.Days,
  )
  const [yearPageStart, setYearPageStart] = useState<number>(() =>
    buildYearPageStart(displayMonth.getFullYear()),
  )
  const minYear = bounds.startMonth.getFullYear()
  const maxYear = bounds.endMonth.getFullYear()
  const minYearPageStart = buildYearPageStart(minYear)
  const maxYearPageStart = buildYearPageStart(maxYear)
  const years = buildYearGridYears(yearPageStart)
  const months = buildMonthGridItems(displayMonth.getFullYear())

  const canGoPrevious =
    viewMode === DATE_RANGE_PICKER_VIEW_MODE.Years
      ? yearPageStart > minYearPageStart
      : viewMode === DATE_RANGE_PICKER_VIEW_MODE.Months
        ? isMonthWithinBounds(
            addYears(displayMonth, -1),
            bounds.startMonth,
            bounds.endMonth,
          )
        : isMonthWithinBounds(
            addMonths(displayMonth, -1),
            bounds.startMonth,
            bounds.endMonth,
          )

  const canGoNext =
    viewMode === DATE_RANGE_PICKER_VIEW_MODE.Years
      ? yearPageStart < maxYearPageStart
      : viewMode === DATE_RANGE_PICKER_VIEW_MODE.Months
        ? isMonthWithinBounds(
            addYears(displayMonth, 1),
            bounds.startMonth,
            bounds.endMonth,
          )
        : isMonthWithinBounds(
            addMonths(displayMonth, 1),
            bounds.startMonth,
            bounds.endMonth,
          )

  const handlePrevious = (): void => {
    if (viewMode === DATE_RANGE_PICKER_VIEW_MODE.Years) {
      setYearPageStart(
        (current: number): number =>
          Math.max(minYearPageStart, current - DATE_RANGE_PICKER_YEAR_PAGE_SIZE),
      )
      return
    }
    if (viewMode === DATE_RANGE_PICKER_VIEW_MODE.Months) {
      setDisplayMonth(
        (current: Date): Date =>
          clampDisplayMonth(
            addYears(current, -1),
            bounds.startMonth,
            bounds.endMonth,
          ),
      )
      return
    }
    setDisplayMonth(
      (current: Date): Date =>
        clampDisplayMonth(
          addMonths(current, -1),
          bounds.startMonth,
          bounds.endMonth,
        ),
    )
  }

  const handleNext = (): void => {
    if (viewMode === DATE_RANGE_PICKER_VIEW_MODE.Years) {
      setYearPageStart(
        (current: number): number =>
          Math.min(maxYearPageStart, current + DATE_RANGE_PICKER_YEAR_PAGE_SIZE),
      )
      return
    }
    if (viewMode === DATE_RANGE_PICKER_VIEW_MODE.Months) {
      setDisplayMonth(
        (current: Date): Date =>
          clampDisplayMonth(
            addYears(current, 1),
            bounds.startMonth,
            bounds.endMonth,
          ),
      )
      return
    }
    setDisplayMonth(
      (current: Date): Date =>
        clampDisplayMonth(
          addMonths(current, 1),
          bounds.startMonth,
          bounds.endMonth,
        ),
    )
  }

  const handleCaptionClick = (): void => {
    setYearPageStart(buildYearPageStart(displayMonth.getFullYear()))
    setViewMode(DATE_RANGE_PICKER_VIEW_MODE.Years)
  }

  const handleSelectYear = (year: number): void => {
    const nextMonth = clampDisplayMonth(
      new Date(year, displayMonth.getMonth(), 1),
      bounds.startMonth,
      bounds.endMonth,
    )
    setDisplayMonth(nextMonth)
    setViewMode(DATE_RANGE_PICKER_VIEW_MODE.Months)
  }

  const handleSelectMonth = (monthIndex: number): void => {
    const nextMonth = clampDisplayMonth(
      new Date(displayMonth.getFullYear(), monthIndex, 1),
      bounds.startMonth,
      bounds.endMonth,
    )
    setDisplayMonth(nextMonth)
    setViewMode(DATE_RANGE_PICKER_VIEW_MODE.Days)
  }

  return (
    <div
      className={DATE_RANGE_PICKER_CALENDAR_CLASS}
      role="group"
      aria-label={ariaLabel}
    >
      <DateRangePickerHeader
        viewMode={viewMode}
        displayMonth={displayMonth}
        yearPageStart={yearPageStart}
        yearPageSize={DATE_RANGE_PICKER_YEAR_PAGE_SIZE}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onCaptionClick={handleCaptionClick}
      />
      {viewMode === DATE_RANGE_PICKER_VIEW_MODE.Years ? (
        <DateRangePickerYearGrid
          years={years}
          selectedYear={displayMonth.getFullYear()}
          minYear={minYear}
          maxYear={maxYear}
          onSelectYear={handleSelectYear}
        />
      ) : null}
      {viewMode === DATE_RANGE_PICKER_VIEW_MODE.Months ? (
        <DateRangePickerMonthGrid
          year={displayMonth.getFullYear()}
          months={months}
          selectedMonthIndex={displayMonth.getMonth()}
          startMonth={bounds.startMonth}
          endMonth={bounds.endMonth}
          onSelectMonth={handleSelectMonth}
        />
      ) : null}
      {viewMode === DATE_RANGE_PICKER_VIEW_MODE.Days ? (
        <DayPicker
          mode="single"
          required={false}
          month={displayMonth}
          onMonthChange={(nextMonth: Date): void => {
            setDisplayMonth(
              clampDisplayMonth(
                nextMonth,
                bounds.startMonth,
                bounds.endMonth,
              ),
            )
          }}
          selected={selected}
          onSelect={onSelect}
          disabled={disabled}
          hideNavigation
          startMonth={bounds.startMonth}
          endMonth={bounds.endMonth}
          className={DATE_RANGE_PICKER_ROOT_CLASS}
          components={{
            MonthCaption: DateRangePickerHiddenCaption,
          }}
        />
      ) : null}
    </div>
  )
}
