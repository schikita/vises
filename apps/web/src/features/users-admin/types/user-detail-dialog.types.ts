import type { Role, UserListItem } from '@/entities/user'

export type UserDetailDialogProps = {
  user: UserListItem | null
  actorRole: Role | undefined
  actorId: string | undefined
  statusBusy: boolean
  statusError: string
  onClose: () => void
  onOpenLatestApp: (appId: string) => void
  onSetActive: (userId: string, active: boolean) => void
}
