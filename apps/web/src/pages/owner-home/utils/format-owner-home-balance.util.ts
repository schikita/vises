/** Format agent balance decimal string for Система teaser (REQ-008). */
export const formatOwnerHomeBalance = (balance: string): string => {
  const trimmed = balance.trim()
  if (!trimmed) {
    return '—'
  }
  const numeric = Number(trimmed)
  if (!Number.isFinite(numeric)) {
    return `${trimmed} ₽`
  }
  return `${new Intl.NumberFormat('ru-RU').format(numeric)} ₽`
}
