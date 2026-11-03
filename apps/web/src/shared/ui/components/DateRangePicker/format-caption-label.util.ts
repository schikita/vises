import { format } from 'date-fns'
import { DATE_RANGE_PICKER_VIEW_MODE } from './date-range-picker.constants'
import type { DateRangePickerViewMode } from './date-range-picker.types'

export const formatCaptionLabel = (
  viewMode: DateRangePickerViewMode,
  displayMonth: Date,
  yearPageStart: number,
  yearPageSize: number,
): string => {
  if (viewMode === DATE_RANGE_PICKER_VIEW_MODE.Years) {
    const pageEnd = yearPageStart + yearPageSize - 1
    return `${yearPageStart} – ${pageEnd}`
  }

  if (viewMode === DATE_RANGE_PICKER_VIEW_MODE.Months) {
    return format(displayMonth, 'yyyy')
  }

  return format(displayMonth, 'MMMM yyyy')
}
