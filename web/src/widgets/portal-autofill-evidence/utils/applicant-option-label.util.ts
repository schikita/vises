import type { Applicant } from '@/entities/application'

export const applicantOptionLabel = (person: Applicant) => {
  const name = `${person.firstName} ${person.lastName}`.trim() || 'Без имени'
  const shortId = person.id.length > 8 ? person.id.slice(-6) : person.id
  return `${name} (${shortId})`
}
