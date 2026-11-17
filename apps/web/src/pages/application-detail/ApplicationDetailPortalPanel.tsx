import type { ReactElement } from 'react'
import { PortalOnePageFormSections } from '@/features/application-form'
import { Btn, Empty } from '@/shared/ui'
import type { ApplicationDetailPortalPanelProps } from './types/application-detail-portal-panel.types'

export const ApplicationDetailPortalPanel = ({
  loading,
  loadError,
  saving,
  saveError,
  saved,
  onSaveAll,
}: ApplicationDetailPortalPanelProps): ReactElement => {
  if (loading) {
    return <Empty title="Загрузка анкеты…" text="Читаем данные клиента и заявки." />
  }

  if (loadError) {
    return <Empty title="Не удалось загрузить анкету" text={loadError} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Одна страница BLS Edit Member. «Сохранить всё» пишет паспорт, портал-форму и заявку
          по шагам.
        </p>
        <Btn type="button" disabled={saving} onClick={onSaveAll}>
          {saving ? 'Сохраняем…' : saved ? 'Сохранено' : 'Сохранить всё'}
        </Btn>
      </div>
      {saveError ? <p className="text-sm font-semibold text-clay">{saveError}</p> : null}
      <PortalOnePageFormSections title="Анкета портала" />
    </div>
  )
}
