import type { IssuedAccess } from '@/entities/user'

export type ApplicationCreateIssuedAccessProps = {
  issued: IssuedAccess
  onGoToApp: () => void
}
