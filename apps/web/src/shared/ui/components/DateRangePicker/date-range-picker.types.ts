import type { Matcher } from 'react-day-picker'

export type DateRangePickerProps = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
  presetLabels?: DateRangePickerPresetLabels
}

export type DayPickerBounds = {
  startMonth: Date
  endMonth: Date
}

export type DateRangePickerCalendarProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  initialMonth: Date
  bounds: DayPickerBounds
  disabled?: Matcher
  ariaLabel: string
}

export type CalendarInitialMonths = {
  start: Date
  end: Date
}

export type DateRangePickerViewMode = 'days' | 'months' | 'years'

export type DateRangePickerPresetId =
  | 'last_7_days'
  | 'this_month'
  | 'this_year'

export type DateRangePickerPresetLabels = {
  last7Days: string
  thisMonth: string
  thisYear: string
}

export type DateRangePickerIsoRange = {
  from: string
  to: string
}

export type DateRangePickerMonthItem = {
  monthIndex: number
  label: string
  date: Date
}

export type DateRangePickerHeaderProps = {
  viewMode: DateRangePickerViewMode
  displayMonth: Date
  yearPageStart: number
  yearPageSize: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
  onCaptionClick: () => void
}

export type DateRangePickerYearGridProps = {
  years: number[]
  selectedYear: number
  minYear: number
  maxYear: number
  onSelectYear: (year: number) => void
}

export type DateRangePickerMonthGridProps = {
  year: number
  months: DateRangePickerMonthItem[]
  selectedMonthIndex: number
  startMonth: Date
  endMonth: Date
  onSelectMonth: (monthIndex: number) => void
}

export type DateRangePickerPresetsProps = {
  labels: DateRangePickerPresetLabels
  onSelectPreset: (presetId: DateRangePickerPresetId) => void
}
