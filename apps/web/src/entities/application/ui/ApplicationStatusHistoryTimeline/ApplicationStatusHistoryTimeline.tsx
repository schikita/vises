import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/shared/lib'
import { Empty, StatusBadge } from '@/shared/ui'
import { isApplicationStatus } from '../../utils/is-application-status.util'
import type { ApplicationStatusHistoryTimelineProps } from '../../types/application-status-history-timeline.types'

/**
 * Immutable status history from companion API (FE10 / AC-9).
 * Renders `items` as returned (oldest→newest). Never uses AppOut.timeline.
 */
export const ApplicationStatusHistoryTimeline = ({
  items,
  loading,
  error,
  emptyTitle,
  emptyText,
  loadingTitle,
  loadingText,
}: ApplicationStatusHistoryTimelineProps): React.ReactElement => {
  const { t } = useTranslation()

  if (loading) {
    return <Empty title={loadingTitle} text={loadingText} />
  }

  if (error) {
    return (
      <p className="text-sm font-medium text-danger" role="alert">
        {error}
      </p>
    )
  }

  if (items.length === 0) {
    return <Empty title={emptyTitle} text={emptyText} />
  }

  return (
    <ol className="space-y-3">
      {items.map(
        (item): React.ReactElement => {
          const toLabel = isApplicationStatus(item.toStatus)
            ? t(`applications.status.${item.toStatus}`)
            : item.toStatus
          const fromLabel =
            item.fromStatus === null
              ? t('applications.history.noPriorStatus')
              : isApplicationStatus(item.fromStatus)
                ? t(`applications.status.${item.fromStatus}`)
                : item.fromStatus
          return (
            <li
              key={item.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={item.toStatus} label={toLabel} />
                <span className="text-text-secondary">
                  {t('applications.history.transition', {
                    from: fromLabel,
                    to: toLabel,
                  })}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {t(`applications.history.actorRole.${item.actorRole}`)}
                {item.actorId
                  ? ` · ${t('applications.history.actorId', { id: item.actorId })}`
                  : ''}
                {' · '}
                {formatDateTime(item.createdAt)}
              </p>
              {item.trigger ? (
                <p className="mt-1 text-xs text-text-secondary">
                  {t('applications.history.trigger', { trigger: item.trigger })}
                </p>
              ) : null}
              {item.reason ? (
                <p className="mt-1 text-xs text-text-secondary">{item.reason}</p>
              ) : null}
            </li>
          )
        },
      )}
    </ol>
  )
}
