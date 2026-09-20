import type { Application } from '@/entities/application'

export const isUpcomingVisit = (app: Application, todayIsoDate: string): boolean =>
  Boolean(app.visitDate) && app.visitDate >= todayIsoDate && app.status !== 'done'
