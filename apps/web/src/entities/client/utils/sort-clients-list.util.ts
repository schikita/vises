import type { ClientListDto } from '@vises/contracts'
import type { ClientsListSortBy } from '../types/clients-list-sort-by.types'
import type { ClientsListSortDir } from '../types/clients-list-sort-dir.types'

const compareStrings = (a: string, b: string, dir: ClientsListSortDir): number => {
  const result = a.localeCompare(b)
  return dir === 'asc' ? result : -result
}

/** Sort SoT `ClientListDto` rows client-side. */
export const sortClientsList = (
  rows: ClientListDto[],
  sortBy: ClientsListSortBy,
  sortDir: ClientsListSortDir,
): ClientListDto[] => {
  const copy = [...rows]
  copy.sort((left, right): number => {
    switch (sortBy) {
      case 'firstName': {
        const leftName = `${left.firstName} ${left.lastName}`.trim()
        const rightName = `${right.firstName} ${right.lastName}`.trim()
        return compareStrings(leftName, rightName, sortDir)
      }
      case 'agentId':
        return compareStrings(left.agentId, right.agentId, sortDir)
      case 'status':
        return compareStrings(left.status, right.status, sortDir)
      case 'createdAt':
        return compareStrings(left.createdAt, right.createdAt, sortDir)
      default:
        return 0
    }
  })
  return copy
}
