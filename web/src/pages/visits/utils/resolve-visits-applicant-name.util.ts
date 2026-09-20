import type { Application } from '@/entities/application'

export const resolveVisitsApplicantName = (app: Application): string => {
  const person = app.applicants[0]
  if (!person) return app.code || ''
  const name = `${person.firstName} ${person.lastName}`.trim()
  return name || app.code || ''
}
