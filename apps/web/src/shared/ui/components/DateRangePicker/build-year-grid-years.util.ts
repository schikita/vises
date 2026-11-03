import { DATE_RANGE_PICKER_YEAR_PAGE_SIZE } from './date-range-picker.constants'

export const buildYearGridYears = (pageStart: number): number[] => {
  return Array.from(
    { length: DATE_RANGE_PICKER_YEAR_PAGE_SIZE },
    (_: unknown, index: number): number => pageStart + index,
  )
}
