import { APPLICATION_STATUS_PROGRESS_ORDER } from '../constants'
import type { Application } from '../types'

export const progress = (app: Application): number => {
  if (app.status === 'declined') return 0
  const i = APPLICATION_STATUS_PROGRESS_ORDER.indexOf(app.status)
  if (i < 0) return 0
  return Math.round(((i + 1) / APPLICATION_STATUS_PROGRESS_ORDER.length) * 100)
}
