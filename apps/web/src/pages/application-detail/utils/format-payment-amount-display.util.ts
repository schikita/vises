/**
 * Display payment amount without float re-round (AC-21).
 * Form may hold a number; keep digits as a plain string.
 */
export const formatPaymentAmountDisplay = (amount: unknown): string => {
  if (typeof amount === 'string') {
    return amount
  }
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return String(amount)
  }
  return ''
}
