/** Format Proxy6 balance + currency for Settings UI. */
export const formatProxy6Balance = (
  balance: string | number | null | undefined,
  currency: string | null | undefined,
  unavailableLabel: string,
): string => {
  if (balance === null || balance === undefined || balance === '') {
    return unavailableLabel
  }
  const amount = String(balance).trim()
  if (!amount) return unavailableLabel
  const unit = currency?.trim()
  return unit ? `${amount} ${unit}` : amount
}
