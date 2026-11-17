import type {
  DateRangePickerPresetId,
  DateRangePickerPresetLabels,
  DateRangePickerViewMode,
} from './date-range-picker.types'

export const DATE_RANGE_PICKER_TRIGGER_CLASS =
  'field flex w-full items-center justify-between gap-2 text-left tabular-nums'

export const DATE_RANGE_PICKER_PLACEHOLDER_CLASS = 'text-muted'

export const DATE_RANGE_PICKER_VALUE_CLASS = 'text-ink'

export const DATE_RANGE_PICKER_ROOT_CLASS = 'vises-day-picker'

export const DATE_RANGE_PICKER_PANEL_CLASS = 'vises-date-range-picker-panel'

/** Keep dual calendars (incl. year grids) in one horizontal panel without scroll. */
export const DATE_RANGE_PICKER_POPOVER_CONTENT_CLASS =
  'w-max overflow-hidden'

export const DATE_RANGE_PICKER_CALENDARS_CLASS =
  'vises-date-range-picker-calendars'

export const DATE_RANGE_PICKER_CALENDAR_CLASS =
  'vises-date-range-picker-calendar'

export const DATE_RANGE_PICKER_START_ARIA_LABEL = 'Start date'

export const DATE_RANGE_PICKER_END_ARIA_LABEL = 'End date'

export const DATE_RANGE_PICKER_DEFAULT_PLACEHOLDER = 'DD.MM.YYYY - DD.MM.YYYY'

/**
 * Inclusive years behind and ahead of the current year for calendar bounds
 * (DEC-FE22-1: CurrentYear−30 … CurrentYear+30).
 */
export const DATE_RANGE_PICKER_YEAR_WINDOW = 30

/** Years shown per year-grid page (decade window). */
export const DATE_RANGE_PICKER_YEAR_PAGE_SIZE = 10

export const DATE_RANGE_PICKER_VIEW_MODE = {
  Days: 'days',
  Months: 'months',
  Years: 'years',
} as const satisfies Record<string, DateRangePickerViewMode>

export const DATE_RANGE_PICKER_PRESET = {
  Last7Days: 'last_7_days',
  ThisMonth: 'this_month',
  ThisYear: 'this_year',
} as const satisfies Record<string, DateRangePickerPresetId>

export const DATE_RANGE_PICKER_PRESET_ORDER: ReadonlyArray<{
  id: DateRangePickerPresetId
  labelKey: keyof DateRangePickerPresetLabels
}> = [
  { id: DATE_RANGE_PICKER_PRESET.Last7Days, labelKey: 'last7Days' },
  { id: DATE_RANGE_PICKER_PRESET.ThisMonth, labelKey: 'thisMonth' },
  { id: DATE_RANGE_PICKER_PRESET.ThisYear, labelKey: 'thisYear' },
]

export const DATE_RANGE_PICKER_DEFAULT_PRESET_LABELS: DateRangePickerPresetLabels =
  {
    last7Days: 'Last 7 days',
    thisMonth: 'This Month',
    thisYear: 'This Year',
  }

export const DATE_RANGE_PICKER_HEADER_CLASS =
  'vises-date-range-picker-header'

export const DATE_RANGE_PICKER_HEADER_CAPTION_CLASS =
  'vises-date-range-picker-header__caption'

export const DATE_RANGE_PICKER_HEADER_NAV_CLASS =
  'vises-date-range-picker-header__nav'

export const DATE_RANGE_PICKER_YEAR_GRID_CLASS =
  'vises-date-range-picker-year-grid'

export const DATE_RANGE_PICKER_MONTH_GRID_CLASS =
  'vises-date-range-picker-month-grid'

export const DATE_RANGE_PICKER_GRID_CELL_CLASS =
  'vises-date-range-picker-grid-cell'

export const DATE_RANGE_PICKER_GRID_CELL_ACTIVE_CLASS =
  'vises-date-range-picker-grid-cell--active'

export const DATE_RANGE_PICKER_GRID_CELL_DISABLED_CLASS =
  'vises-date-range-picker-grid-cell--disabled'

export const DATE_RANGE_PICKER_PRESETS_CLASS =
  'vises-date-range-picker-presets'

export const DATE_RANGE_PICKER_PRESET_BUTTON_CLASS =
  'vises-date-range-picker-preset'
