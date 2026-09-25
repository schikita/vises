/** Civil calendar `{year, month, day}` (month 1–12) for date-only math (DEC-007). */
export type DateOnlyParts = {
  year: number
  month: number
  day: number
}

/** Result of strict `YYYY-MM-DD` parse (REQ-004 / CON-003). */
export type ParseDateOnlyResult =
  | { status: 'missing' }
  | { status: 'unparseable' }
  | { status: 'ok'; ymd: string; parts: DateOnlyParts }
