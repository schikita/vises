import type { Application } from '@/entities/application'

export const resolveAppsListSortName = (app: Application): string => {
  const person = app.applicants[0]
  if (!person) return app.code
  return `${person.firstName} ${person.lastName}`.trim() || app.code
}
