import { DATE_RANGE_PICKER_YEAR_PAGE_SIZE } from './date-range-picker.constants'

export const buildYearPageStart = (year: number): number => {
  return (
    Math.floor(year / DATE_RANGE_PICKER_YEAR_PAGE_SIZE) *
    DATE_RANGE_PICKER_YEAR_PAGE_SIZE
  )
}
