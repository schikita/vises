import { uid } from '@/shared/lib'

export const genLogin = (name: string, email: string) => {
  const fromEmail = email.trim().toLowerCase()
  if (fromEmail) return fromEmail
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
  return ascii || `user-${uid().slice(-6)}`
}
