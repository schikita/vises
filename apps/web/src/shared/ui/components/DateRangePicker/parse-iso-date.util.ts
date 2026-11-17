import { isValid, parse } from 'date-fns'

export const parseIsoDate = (value: string): Date | undefined => {
  if (value.trim() === '') {
    return undefined
  }
  const parsed = parse(value, 'yyyy-MM-dd', new Date())
  if (!isValid(parsed)) {
    return undefined
  }
  return parsed
}
