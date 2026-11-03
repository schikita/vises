import { useState } from 'react'
import { addMonths, addYears } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { Popover } from '../Popover'
import { buildDayPickerBounds } from './build-day-picker-bounds.util'
import { buildMonthGridItems } from './build-month-grid-items.util'
import { buildPresetRange } from './build-preset-range.util'
import { buildYearGridYears } from './build-year-grid-years.util'
import { buildYearPageStart } from './build-year-page-start.util'
import { clampDisplayMonth } from './clamp-display-month.util'
import {
  DATE_RANGE_PICKER_DEFAULT_PLACEHOLDER,
  DATE_RANGE_PICKER_DEFAULT_PRESET_LABELS,
  DATE_RANGE_PICKER_PANEL_CLASS,
  DATE_RANGE_PICKER_PLACEHOLDER_CLASS,
  DATE_RANGE_PICKER_ROOT_CLASS,
  DATE_RANGE_PICKER_TRIGGER_CLASS,
  DATE_RANGE_PICKER_VALUE_CLASS,
  DATE_RANGE_PICKER_VIEW_MODE,
  DATE_RANGE_PICKER_YEAR_PAGE_SIZE,
} from './date-range-picker.constants'
import type {
  DateRangePickerPresetId,
  DateRangePickerProps,
  DateRangePickerViewMode,
} from './date-range-picker.types'
import { DateRangePickerHeader } from './DateRangePickerHeader'
import { DateRangePickerHiddenCaption } from './DateRangePickerHiddenCaption'
import { DateRangePickerMonthGrid } from './DateRangePickerMonthGrid'
import { DateRangePickerPresets } from './DateRangePickerPresets'
import { DateRangePickerYearGrid } from './DateRangePickerYearGrid'
import { formatDateRangeDisplay } from './format-date-range-display.util'
import { formatIsoDate } from './format-iso-date.util'
import { isMonthWithinBounds } from './is-month-within-bounds.util'
import { parseIsoDate } from './parse-iso-date.util'
import 'react-day-picker/style.css'
import './date-range-picker.css'

export const DateRangePicker = (props: DateRangePickerProps): React.ReactElement => {
  const {
    from,
    to,
    onFromChange,
    onToChange,
    placeholder = DATE_RANGE_PICKER_DEFAULT_PLACEHOLDER,
    ariaLabel,
    className = '',
    presetLabels = DATE_RANGE_PICKER_DEFAULT_PRESET_LABELS,
  } = props
  const [open, setOpen] = useState(false)
  const bounds = buildDayPickerBounds()
  const fromDate = parseIsoDate(from)
  const toDate = parseIsoDate(to)
  const [displayMonth, setDisplayMonth] = useState<Date>(() =>
    clampDisplayMonth(
      fromDate ?? toDate ?? new Date(),
      bounds.startMonth,
      bounds.endMonth,
    ),
  )
  const [viewMode, setViewMode] = useState<DateRangePickerViewMode>(
    DATE_RANGE_PICKER_VIEW_MODE.Days,
  )
  const [yearPageStart, setYearPageStart] = useState<number>(() =>
    buildYearPageStart(displayMonth.getFullYear()),
  )
  const selected: DateRange | undefined =
    fromDate || toDate
      ? {
          from: fromDate,
          to: toDate,
        }
      : undefined
  const hasCompleteRange = Boolean(fromDate && toDate)
  const label = formatDateRangeDisplay(from, to, placeholder)
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

  const handleSelect = (range: DateRange | undefined): void => {
    onFromChange(range?.from ? formatIsoDate(range.from) : '')
    onToChange(range?.to ? formatIsoDate(range.to) : '')
  }

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen) {
      const nextMonth = clampDisplayMonth(
        fromDate ?? toDate ?? displayMonth,
        bounds.startMonth,
        bounds.endMonth,
      )
      setDisplayMonth(nextMonth)
      setYearPageStart(buildYearPageStart(nextMonth.getFullYear()))
      setViewMode(DATE_RANGE_PICKER_VIEW_MODE.Days)
    }
  }

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

  const handleSelectPreset = (presetId: DateRangePickerPresetId): void => {
    const range = buildPresetRange(presetId)
    onFromChange(range.from)
    onToChange(range.to)
    const nextMonth = clampDisplayMonth(
      parseIsoDate(range.to) ?? new Date(),
      bounds.startMonth,
      bounds.endMonth,
    )
    setDisplayMonth(nextMonth)
    setYearPageStart(buildYearPageStart(nextMonth.getFullYear()))
    setViewMode(DATE_RANGE_PICKER_VIEW_MODE.Days)
  }

  return (
    <div className={className}>
      <Popover
        open={open}
        onOpenChange={handleOpenChange}
        contentAriaLabel={ariaLabel}
        trigger={
          <button
            type="button"
            className={DATE_RANGE_PICKER_TRIGGER_CLASS}
            aria-label={ariaLabel}
          >
            <span
              className={
                hasCompleteRange
                  ? DATE_RANGE_PICKER_VALUE_CLASS
                  : DATE_RANGE_PICKER_PLACEHOLDER_CLASS
              }
            >
              {label}
            </span>
            <CalendarDays
              size={16}
              className="shrink-0 text-text-secondary"
              aria-hidden
            />
          </button>
        }
      >
        <div className={DATE_RANGE_PICKER_PANEL_CLASS}>
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
              mode="range"
              resetOnSelect
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
              onSelect={handleSelect}
              hideNavigation
              startMonth={bounds.startMonth}
              endMonth={bounds.endMonth}
              className={DATE_RANGE_PICKER_ROOT_CLASS}
              components={{
                MonthCaption: DateRangePickerHiddenCaption,
              }}
            />
          ) : null}
          <DateRangePickerPresets
            labels={presetLabels}
            onSelectPreset={handleSelectPreset}
          />
        </div>
      </Popover>
    </div>
  )
}
