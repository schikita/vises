import type { ReactElement } from 'react'
import { ROLE_LABEL } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'
import { Avatar, Btn, Dialog } from '@/shared/ui'
import {
  USER_DETAIL_ACTIVATE,
  USER_DETAIL_AGENT_HAS_APPS,
  USER_DETAIL_AGENT_NO_APPS,
  USER_DETAIL_CLOSE,
  USER_DETAIL_DEACTIVATE,
  USER_DETAIL_LABELS,
  USER_DETAIL_OPEN_LATEST_APP,
  USER_DETAIL_ROLE_DESCRIPTION,
  USER_DETAIL_STAFF_NO_APPS_HINT,
  USER_DETAIL_STATUS,
  USER_DETAIL_TITLE,
} from '../../constants'
import type { UserDetailDialogProps } from '../../types'
import { canMutateStaffUser } from '../../utils'

export const UserDetailDialog = ({
  user,
  actorRole,
  actorId,
  statusBusy,
  statusError,
  onClose,
  onOpenLatestApp,
  onSetActive,
}: UserDetailDialogProps): ReactElement | null => {
  if (!user) return null

  const isAgent = user.role === 'agent'
  const roleNote = isAgent
    ? user.latestAppId
      ? USER_DETAIL_AGENT_HAS_APPS
      : USER_DETAIL_AGENT_NO_APPS
    : USER_DETAIL_STAFF_NO_APPS_HINT
  const canChangeStatus = canMutateStaffUser({
    actorRole,
    targetRole: user.role,
    actorId,
    targetId: user.id,
  })

  return (
    <Dialog open title={USER_DETAIL_TITLE} onClose={onClose}>
      <div className="flex items-center gap-3">
        <Avatar name={user.name} size={48} />
        <div>
          <p className="text-base font-extrabold tracking-tight">{user.name}</p>
          <p className="text-sm text-muted">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {USER_DETAIL_ROLE_DESCRIPTION[user.role]}
      </p>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{USER_DETAIL_LABELS.login}</dt>
          <dd className="font-semibold">{user.login}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{USER_DETAIL_LABELS.email}</dt>
          <dd className="break-all font-semibold">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{USER_DETAIL_LABELS.status}</dt>
          <dd>
            <span
              className={`rounded-full px-2 py-1 text-xs font-bold ${
                user.active
                  ? 'bg-[#e4f3ea] text-[#1f6b42]'
                  : 'bg-[#fbe7e0] text-clay'
              }`}
            >
              {user.active
                ? USER_DETAIL_STATUS.active
                : USER_DETAIL_STATUS.inactive}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{USER_DETAIL_LABELS.createdAt}</dt>
          <dd className="font-semibold">{formatDateTime(user.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{USER_DETAIL_LABELS.updatedAt}</dt>
          <dd className="font-semibold">{formatDateTime(user.updatedAt)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{USER_DETAIL_LABELS.id}</dt>
          <dd className="font-mono text-xs font-semibold text-forest">
            {user.id}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-muted" role="status">
        {roleNote}
      </p>

      {statusError ? (
        <p className="mt-3 text-sm font-semibold text-clay" role="alert">
          {statusError}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {canChangeStatus ? (
          <Btn
            type="button"
            variant={user.active ? 'soft' : undefined}
            disabled={statusBusy}
            onClick={() => onSetActive(user.id, !user.active)}
          >
            {statusBusy
              ? '…'
              : user.active
                ? USER_DETAIL_DEACTIVATE
                : USER_DETAIL_ACTIVATE}
          </Btn>
        ) : null}
        {isAgent && user.latestAppId ? (
          <Btn
            type="button"
            onClick={() => {
              if (user.latestAppId) onOpenLatestApp(user.latestAppId)
            }}
          >
            {USER_DETAIL_OPEN_LATEST_APP}
          </Btn>
        ) : null}
        <Btn type="button" variant="ghost" onClick={onClose}>
          {USER_DETAIL_CLOSE}
        </Btn>
      </div>
    </Dialog>
  )
}
