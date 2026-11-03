import type { UsersConfirmAction } from './users-confirm-action.types'

export type UsersConfirmDialogProps = {
  open: boolean
  pending: boolean
  action: UsersConfirmAction | null
  onCancel: () => void
  onApply: () => void
}
