import type { UsersConfirmAction } from '../types'

/** i18n key for a users admin confirm dialog title (named user + action). */
export const resolveUsersConfirmTitleKey = (
  action: UsersConfirmAction,
):
  | 'usersAdmin.confirm.reissue'
  | 'usersAdmin.confirm.disable'
  | 'usersAdmin.confirm.enable'
  | 'usersAdmin.confirm.remove' => {
  if (action.kind === 'reissue') {
    return 'usersAdmin.confirm.reissue'
  }
  if (action.kind === 'remove') {
    return 'usersAdmin.confirm.remove'
  }
  return action.active
    ? 'usersAdmin.confirm.disable'
    : 'usersAdmin.confirm.enable'
}
