import { useTranslation } from 'react-i18next'
import { Btn, StatusBadge } from '@/shared/ui'
import type { ApplicationStatusChangeControlsRenderProps } from '../../types'

export const ApplicationStatusChangeControlsRender = ({
  currentStatus,
  targets,
  pending,
  apiError,
  onChangeStatus,
}: ApplicationStatusChangeControlsRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">
          {t('applications.statusChange.current')}
        </span>
        <StatusBadge
          status={currentStatus}
          label={t(`applications.status.${currentStatus}`)}
        />
      </div>

      {targets.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {t('applications.statusChange.noTargets')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {targets.map(
            (target): React.ReactElement => (
              <Btn
                key={target}
                type="button"
                disabled={pending}
                onClick={(): void => {
                  onChangeStatus(target)
                }}
              >
                {pending
                  ? t('applications.statusChange.submitting')
                  : t('applications.statusChange.to', {
                      status: t(`applications.status.${target}`),
                    })}
              </Btn>
            ),
          )}
        </div>
      )}

      {apiError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {apiError}
        </p>
      ) : null}
    </div>
  )
}
