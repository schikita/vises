import { isValid, parse } from 'date-fns'

/** Parse a stored yyyy-MM-dd value. Empty or invalid input stays unset. */
export const parsePortalDateYmd = (value: string): Date | undefined => {
  if (value.trim() === '') {
    return undefined
  }
  const parsed = parse(value, 'yyyy-MM-dd', new Date())
  if (!isValid(parsed)) {
    return undefined
  }
  return parsed
}
