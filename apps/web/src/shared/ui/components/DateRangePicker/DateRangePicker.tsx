import { useState, type ReactElement } from 'react'
import { CalendarDays } from 'lucide-react'
import { Popover } from '../Popover'
import { buildCalendarInitialMonths } from './build-calendar-initial-months.util'
import { buildDayPickerBounds } from './build-day-picker-bounds.util'
import { buildEndDayDisabledMatcher } from './build-end-day-disabled-matcher.util'
import { buildPresetRange } from './build-preset-range.util'
import {
  DATE_RANGE_PICKER_CALENDARS_CLASS,
  DATE_RANGE_PICKER_DEFAULT_PLACEHOLDER,
  DATE_RANGE_PICKER_DEFAULT_PRESET_LABELS,
  DATE_RANGE_PICKER_END_ARIA_LABEL,
  DATE_RANGE_PICKER_PANEL_CLASS,
  DATE_RANGE_PICKER_PLACEHOLDER_CLASS,
  DATE_RANGE_PICKER_POPOVER_CONTENT_CLASS,
  DATE_RANGE_PICKER_START_ARIA_LABEL,
  DATE_RANGE_PICKER_TRIGGER_CLASS,
  DATE_RANGE_PICKER_VALUE_CLASS,
} from './date-range-picker.constants'
import type {
  DateRangePickerPresetId,
  DateRangePickerProps,
} from './date-range-picker.types'
import { DateRangePickerCalendar } from './DateRangePickerCalendar'
import { DateRangePickerPresets } from './DateRangePickerPresets'
import { formatDateRangeDisplay } from './format-date-range-display.util'
import { formatIsoDate } from './format-iso-date.util'
import { parseIsoDate } from './parse-iso-date.util'
import { shouldClearToAfterFromChange } from './should-clear-to-after-from-change.util'
import 'react-day-picker/style.css'
import './date-range-picker.css'

export const DateRangePicker = (props: DateRangePickerProps): ReactElement => {
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
  const [calendarSyncKey, setCalendarSyncKey] = useState(0)
  const bounds = buildDayPickerBounds()
  const fromDate = parseIsoDate(from)
  const toDate = parseIsoDate(to)
  const [startInitialMonth, setStartInitialMonth] = useState<Date>(
    (): Date => buildCalendarInitialMonths(fromDate, toDate, bounds).start,
  )
  const [endInitialMonth, setEndInitialMonth] = useState<Date>(
    (): Date => buildCalendarInitialMonths(fromDate, toDate, bounds).end,
  )
  const hasCompleteRange = Boolean(fromDate && toDate)
  const label = formatDateRangeDisplay(from, to, placeholder)
  const endDisabled = buildEndDayDisabledMatcher(fromDate)

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen) {
      const months = buildCalendarInitialMonths(fromDate, toDate, bounds)
      setStartInitialMonth(months.start)
      setEndInitialMonth(months.end)
      setCalendarSyncKey((current: number): number => current + 1)
    }
  }

  const handleSelectFrom = (date: Date | undefined): void => {
    const nextFrom = date ? formatIsoDate(date) : ''
    onFromChange(nextFrom)
    if (shouldClearToAfterFromChange(nextFrom, to)) {
      onToChange('')
    }
  }

  const handleSelectTo = (date: Date | undefined): void => {
    onToChange(date ? formatIsoDate(date) : '')
  }

  const handleSelectPreset = (presetId: DateRangePickerPresetId): void => {
    const range = buildPresetRange(presetId)
    const nextFromDate = parseIsoDate(range.from)
    const nextToDate = parseIsoDate(range.to)
    onFromChange(range.from)
    onToChange(range.to)
    const months = buildCalendarInitialMonths(nextFromDate, nextToDate, bounds)
    setStartInitialMonth(months.start)
    setEndInitialMonth(months.end)
    setCalendarSyncKey((current: number): number => current + 1)
  }

  return (
    <div className={className}>
      <Popover
        open={open}
        onOpenChange={handleOpenChange}
        contentAriaLabel={ariaLabel}
        contentClassName={DATE_RANGE_PICKER_POPOVER_CONTENT_CLASS}
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
              className="shrink-0 text-muted"
              aria-hidden
            />
          </button>
        }
      >
        <div className={DATE_RANGE_PICKER_PANEL_CLASS}>
          <div className={DATE_RANGE_PICKER_CALENDARS_CLASS}>
            <DateRangePickerCalendar
              key={`start-${calendarSyncKey}`}
              selected={fromDate}
              onSelect={handleSelectFrom}
              initialMonth={startInitialMonth}
              bounds={bounds}
              ariaLabel={DATE_RANGE_PICKER_START_ARIA_LABEL}
            />
            <DateRangePickerCalendar
              key={`end-${calendarSyncKey}`}
              selected={toDate}
              onSelect={handleSelectTo}
              initialMonth={endInitialMonth}
              bounds={bounds}
              disabled={endDisabled}
              ariaLabel={DATE_RANGE_PICKER_END_ARIA_LABEL}
            />
          </div>
          <DateRangePickerPresets
            labels={presetLabels}
            onSelectPreset={handleSelectPreset}
          />
        </div>
      </Popover>
    </div>
  )
}
