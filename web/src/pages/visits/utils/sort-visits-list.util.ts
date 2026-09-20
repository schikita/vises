import type { Application } from '@/entities/application'
import type { VisitsListSortState } from '../types'
import { resolveVisitsListSortValue } from './resolve-visits-list-sort-value.util'

export const sortVisitsList = (
  visits: readonly Application[],
  sort: VisitsListSortState,
): Application[] => {
  const factor = sort.dir === 'asc' ? 1 : -1
  return [...visits].sort((a, b) => {
    const left = resolveVisitsListSortValue(a, sort.key).toLowerCase()
    const right = resolveVisitsListSortValue(b, sort.key).toLowerCase()
    return left.localeCompare(right, 'ru') * factor
  })
}
