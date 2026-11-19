import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, Empty } from '@/shared/ui'
import type { ClientPortalFormRenderProps } from '../types/client-portal-form-render.types'

export const ClientPortalFormRender = ({
  detailPath,
  showClientBackLink,
  loading,
  loadError,
  title,
  form,
}: ClientPortalFormRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        {showClientBackLink ? (
          <Link
            to={detailPath}
            className="text-sm font-medium text-forest no-underline hover:underline"
          >
            {t('clients.portalForm.back')}
          </Link>
        ) : null}
        <h1
          className={`text-2xl font-semibold tracking-tight text-text-primary${showClientBackLink ? ' mt-2' : ''}`}
        >
          {title}
        </h1>
      </div>

      {loadError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <Empty
          title={t('clients.portalForm.loadingTitle')}
          text={t('clients.portalForm.loadingText')}
        />
      ) : null}

      {!loading && form ? (
        <Card className="space-y-3 rounded-panel border border-border bg-surface px-5 py-5">
          {form}
        </Card>
      ) : null}
    </div>
  )
}
