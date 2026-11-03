import { useTranslation } from 'react-i18next'
import { Btn, Dialog } from '@/shared/ui'
import type { UsersConfirmDialogProps } from './types/users-confirm-dialog.types'
import { resolveUsersConfirmTitleKey } from './utils'

export const UsersConfirmDialog = ({
  open,
  pending,
  action,
  onCancel,
  onApply,
}: UsersConfirmDialogProps): React.ReactElement => {
  const { t } = useTranslation()
  const title =
    action === null
      ? ''
      : t(resolveUsersConfirmTitleKey(action), { name: action.userName })

  return (
    <Dialog open={open && action !== null} title={title} onClose={onCancel}>
      <div className="flex flex-wrap justify-end gap-2">
        <Btn type="button" variant="ghost" disabled={pending} onClick={onCancel}>
          {t('usersAdmin.confirm.cancel')}
        </Btn>
        <Btn type="button" disabled={pending} onClick={onApply}>
          {t('usersAdmin.confirm.apply')}
        </Btn>
      </div>
    </Dialog>
  )
}
