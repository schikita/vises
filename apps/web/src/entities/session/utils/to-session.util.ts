import type { Session, SessionUserInput } from '../types'

export const toSession = (user: SessionUserInput): Session => {
  const email = user.email || user.login || ''
  return {
    userId: user.id,
    role: user.role,
    name: user.name || email,
    email,
    login: user.login || email,
  }
}
