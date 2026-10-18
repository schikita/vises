import { PROXY6_BALANCE_UNAVAILABLE } from '../constants'

/** Format Proxy6 balance + currency for Settings UI. */
export const formatProxy6Balance = (
  balance: string | number | null | undefined,
  currency: string | null | undefined,
): string => {
  if (balance === null || balance === undefined || balance === '') {
    return PROXY6_BALANCE_UNAVAILABLE
  }
  const amount = String(balance).trim()
  if (!amount) return PROXY6_BALANCE_UNAVAILABLE
  const unit = currency?.trim()
  return unit ? `${amount} ${unit}` : amount
}
