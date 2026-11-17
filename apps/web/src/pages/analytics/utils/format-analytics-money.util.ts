import { money } from '@/entities/application'

/**
 * Format Analytics monetary decimal strings (NFR-001) for display.
 * Falls back to the raw string when the value is not a finite number.
 */
export const formatAnalyticsMoney = (value: string): string => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return value
  }
  return money(parsed)
}
