import type { UserMeDto } from '@vises/contracts'
import type { Session } from '../types'

/** Map Decision 2A `UserMeDto` into the SPA session view-model. */
export const toSessionFromMe = (me: UserMeDto): Session => ({
  userId: me.id,
  role: me.role,
  name: me.email,
  firstName: null,
  lastName: null,
  email: me.email,
  login: me.email,
  active: me.active,
  balance: me.balance,
})
