import type { Application } from '@/entities/application'
import type { AppsListSortKey } from '../types'
import { resolveAppsListSortName } from './resolve-apps-list-sort-name.util'

export const resolveAppsListSortValue = (app: Application, key: AppsListSortKey): string => {
  switch (key) {
    case 'name':
      return resolveAppsListSortName(app)
    case 'category':
      return app.category || app.visaType || ''
    case 'city':
      return app.submitCity || ''
    case 'status':
      return app.status || ''
    case 'travelDate':
      return app.travelDate || ''
  }
}
