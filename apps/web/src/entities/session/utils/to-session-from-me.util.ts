import type { UserMeDto } from '@vises/contracts'
import type { Session } from '../types'

/** Map Decision 2A `UserMeDto` into the SPA session view-model. */
export const toSessionFromMe = (me: UserMeDto): Session => {
  const displayName =
    [me.firstName, me.lastName].filter(Boolean).join(' ').trim() || me.email

  return {
    userId: me.id,
    role: me.role,
    name: displayName,
    firstName: me.firstName,
    lastName: me.lastName,
    email: me.email,
    login: me.email,
    active: me.active,
    balance: me.balance,
  }
}
