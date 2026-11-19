import type { ClientListDto } from '@vises/contracts'

/** Case-insensitive search over SoT list row fields. */
export const filterClientsList = (
  rows: ClientListDto[],
  search: string,
): ClientListDto[] => {
  const needle = search.trim().toLowerCase()
  if (needle === '') {
    return rows
  }
  return rows.filter((row): boolean => {
    const haystack = [
      row.id,
      row.agentId,
      row.firstName,
      row.lastName,
      row.maskedPassport,
      row.status,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
}
