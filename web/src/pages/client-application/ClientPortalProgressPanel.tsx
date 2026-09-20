import {
  formatPortalFillSummaryRu,
  portalClientSendLabel,
  portalSiteOutcomeLabel,
} from '@/entities/portal-autofill'
import { Card } from '@/shared/ui'
import type { ClientPortalProgressPanelProps } from './types'

export const ClientPortalProgressPanel = ({
  portalProgress,
}: ClientPortalProgressPanelProps) => {
  if (portalProgress == null) {
    return (
      <Card>
        <p className="font-bold">Статус на портале</p>
        <p className="mt-2 text-sm text-muted">
          Данные о прогрессе автозаполнения пока недоступны.
        </p>
      </Card>
    )
  }

  const fillText = portalProgress.fillSummary
    ? formatPortalFillSummaryRu(portalProgress.fillSummary)
    : 'Сводка заполнения пока недоступна'

  return (
    <Card>
      <p className="font-bold">Статус на портале</p>
      <p className="mt-1 text-xs text-muted">
        Отдельно от статуса заявки в офисе (бейдж выше).
      </p>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="text-muted">Данные в Vises</dt>
          <dd className="font-semibold">
            {portalProgress.dataSaved
              ? 'Сохранены на сервере'
              : 'Не сохранены (только локальный черновик)'}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Отправка на портал</dt>
          <dd className="font-semibold">
            {portalClientSendLabel(portalProgress.portalSend)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Заполнение полей</dt>
          <dd className="font-semibold">{fillText}</dd>
        </div>
        <div>
          <dt className="text-muted">Решение сайта</dt>
          <dd className="font-semibold">
            {portalSiteOutcomeLabel(portalProgress.siteOutcome)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
