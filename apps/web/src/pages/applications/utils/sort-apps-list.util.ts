import type { Application } from '@/entities/application'
import type { AppsListSortState } from '../types'
import { resolveAppsListSortValue } from './resolve-apps-list-sort-value.util'

export const sortAppsList = (apps: readonly Application[], sort: AppsListSortState): Application[] => {
  const factor = sort.dir === 'asc' ? 1 : -1
  return [...apps].sort((a, b) => {
    const left = resolveAppsListSortValue(a, sort.key).toLowerCase()
    const right = resolveAppsListSortValue(b, sort.key).toLowerCase()
    return left.localeCompare(right, 'ru') * factor
  })
}
