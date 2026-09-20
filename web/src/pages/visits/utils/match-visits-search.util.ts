import type { Application } from '@/entities/application'
import type { User } from '@/entities/user'
import { resolveVisitsApplicantName } from './resolve-visits-applicant-name.util'

export const matchVisitsSearch = (
  app: Application,
  query: string,
  users: readonly User[],
): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const client = (app.clientEmail ?? '').trim().toLowerCase()
  const related = users.find((u) => {
    const email = u.email.trim().toLowerCase()
    const login = u.login.trim().toLowerCase()
    return (email && email === client) || (login && login === client)
  })

  const blob = [
    resolveVisitsApplicantName(app),
    app.clientEmail,
    app.code,
    related?.name,
    related?.email,
    related?.login,
  ]
    .join(' ')
    .toLowerCase()

  return blob.includes(q)
}
