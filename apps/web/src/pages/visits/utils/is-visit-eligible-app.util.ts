import type { Application } from '@/entities/application'

export const isVisitEligibleApp = (app: Application): boolean =>
  Boolean(app.visitDate) || app.status === 'booked' || app.status === 'done'
