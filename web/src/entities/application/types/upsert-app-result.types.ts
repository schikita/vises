import type { Application } from './application.types'
import type { IssuedAccess } from '@/entities/user'

/** Upsert response may include credentials when staff create minted a client. */
export type UpsertAppResult = Application & {
  issuedClientAccess?: IssuedAccess
}
