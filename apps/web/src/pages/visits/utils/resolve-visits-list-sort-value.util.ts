import type { Application } from '@/entities/application'
import type { VisitsListSortKey } from '../types'
import { resolveVisitsApplicantName } from './resolve-visits-applicant-name.util'

export const resolveVisitsListSortValue = (app: Application, key: VisitsListSortKey): string => {
  switch (key) {
    case 'applicant':
      return resolveVisitsApplicantName(app)
    case 'city':
      return app.submitCity || ''
    case 'date':
      return app.visitDate || ''
    case 'time':
      return app.visitTime || ''
    case 'place':
      return app.visitPlace || ''
    case 'created':
      return app.createdAt || ''
  }
}
