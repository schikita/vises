import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Btn, Card, Empty, StatusBadge } from '@/shared/ui'
import type { ClientDetailRenderProps } from './types'

export const ClientDetailRender = ({
  listPath,
  applicationPath,
  portalFormPath,
  loading,
  loadError,
  detail,
  canDelete,
  deletePending,
  deleteError,
  passportForm,
  onDelete,
}: ClientDetailRenderProps): React.ReactElement => {
  const { t } = useTranslation()
  const displayName = detail
    ? [detail.firstName, detail.lastName].filter(Boolean).join(' ').trim() ||
      t('clients.list.unnamed')
    : t('clients.detail.unknown')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={listPath}
            className="text-sm font-medium text-forest no-underline hover:underline"
          >
            {t('clients.detail.back')}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
            {displayName}
          </h1>
          {detail ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={detail.applicationStatus}
                label={t(`clients.status.${detail.applicationStatus}`)}
              />
              {applicationPath ? (
                <Link
                  to={applicationPath}
                  className="text-sm font-medium text-forest no-underline hover:underline"
                >
                  {t('clients.detail.openApplication')}
                </Link>
              ) : (
                <span className="text-sm text-text-secondary">
                  {t('clients.detail.applicationId', {
                    id: detail.applicationId,
                  })}
                </span>
              )}
            </div>
          ) : null}
        </div>
        {canDelete && detail ? (
          <Btn
            type="button"
            variant="danger"
            disabled={deletePending}
            onClick={onDelete}
          >
            {deletePending
              ? t('clients.detail.deleting')
              : t('clients.detail.delete')}
          </Btn>
        ) : null}
      </div>

      {loadError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {deleteError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {deleteError}
        </p>
      ) : null}

      {loading ? (
        <Empty
          title={t('clients.detail.loadingTitle')}
          text={t('clients.detail.loadingText')}
        />
      ) : null}

      {!loading && detail && portalFormPath ? (
        <div>
          <Link
            to={portalFormPath}
            className="text-sm font-medium text-forest no-underline hover:underline"
          >
            {t('clients.detail.openPortalForm')}
          </Link>
        </div>
      ) : null}

      {!loading && detail ? (
        <Card className="space-y-3 rounded-panel border border-border bg-surface px-5 py-5">
          <h2 className="font-semibold text-text-primary">
            {t('clients.passport.title')}
          </h2>
          <p className="text-sm text-text-secondary">
            {t('clients.passport.subtitle')}
          </p>
          {passportForm}
        </Card>
      ) : null}
    </div>
  )
}
