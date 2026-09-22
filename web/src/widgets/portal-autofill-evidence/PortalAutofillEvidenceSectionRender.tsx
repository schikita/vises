import {
  portalCaptureStatusLabel,
  portalReportOkLabel,
} from '@/entities/portal-autofill'
import { formatDateTime } from '@/shared/lib'
import { Btn, Card, Empty, Field } from '@/shared/ui'
import { PortalAutofillRunOpsStatus } from './PortalAutofillRunOpsStatus'
import type { PortalAutofillEvidenceSectionRenderProps } from './types'
import { applicantOptionLabel } from './utils'

export const PortalAutofillEvidenceSectionRender = ({
  applicants,
  effectiveApplicantId,
  ready,
  applicantPersisted,
  localCanTrigger,
  actionEligible,
  actionLabel,
  blockedReasonRu,
  busy,
  loading,
  error,
  openError,
  openingId,
  runFeedback,
  runFeedbackIsError,
  statusFeedback,
  runs,
  onSelectApplicant,
  onStartAutofill,
  onOpenScreenshot,
}: PortalAutofillEvidenceSectionRenderProps) => {
  const canClick = localCanTrigger && actionEligible && !busy
  const showBlocked =
    localCanTrigger && !actionEligible && blockedReasonRu != null && blockedReasonRu !== ''

  return (
    <Card className="lg:col-span-2">
      <p className="mb-4 font-bold">Автозаполнение визового портала</p>

      <div className="mb-5 space-y-3 rounded-xl border border-line bg-white px-4 py-3">
        {applicants.length > 1 ? (
          <Field label="Заявитель">
            <select
              className="field"
              value={effectiveApplicantId}
              disabled={busy}
              onChange={(e) => onSelectApplicant(e.target.value)}
            >
              {applicants.map((person) => (
                <option key={person.id} value={person.id}>
                  {applicantOptionLabel(person)}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {!ready && (
          <p className="text-sm font-semibold text-clay">
            Данные заявителя неполны для портала. Заполните ФИО, дату и страну рождения, паспортные
            поля, телефон (ровно 9 цифр) и email заявителя или клиента.
          </p>
        )}

        {ready && !applicantPersisted && (
          <p className="text-sm font-semibold text-clay">
            Сначала сохраните заявку — заявитель ещё не записан на сервере.
          </p>
        )}

        <p className="text-xs text-muted">
          Операционный статус портала ниже — отдельно от статуса заявки (CRM). При успешном заполнении
          и скриншоте статус заявки может стать «На рассмотрении»; ошибка автозаполнения CRM не меняет.
          Статус заявки можно изменить вручную выше.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Btn disabled={!canClick} onClick={onStartAutofill}>
            {busy ? 'Выполняется автозаполнение…' : actionLabel}
          </Btn>
        </div>

        {showBlocked && (
          <p className="text-sm font-semibold text-clay">{blockedReasonRu}</p>
        )}

        {busy && (
          <p className="text-sm font-semibold text-muted">
            Выполняется автозаполнение… Это может занять минуту.
          </p>
        )}
        {runFeedback && !busy && (
          <p
            className={
              runFeedbackIsError
                ? 'text-sm font-semibold text-clay'
                : 'text-sm font-semibold'
            }
          >
            {runFeedback}
          </p>
        )}
        {statusFeedback && !busy && <p className="text-sm font-semibold">{statusFeedback}</p>}
      </div>

      {loading && <p className="text-sm text-muted">Загружаем запуски…</p>}
      {!loading && error && <p className="text-sm font-semibold text-clay">{error}</p>}
      {!loading && !error && runs && runs.length === 0 && (
        <Empty
          title="Пока нет запусков"
          text="После автозаполнения здесь появятся статус и скриншоты."
        />
      )}
      {!loading && !error && runs && runs.length > 0 && (
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-bold">{formatDateTime(run.createdAt)}</p>
                <p className="text-xs text-muted">Заявитель: {run.applicantId}</p>
                <p className="text-sm font-semibold">
                  {portalCaptureStatusLabel(run.captureStatus)}
                </p>
                <p className="text-sm">{portalReportOkLabel(run.reportOk, run.status)}</p>
                <PortalAutofillRunOpsStatus run={run} />
              </div>
              {run.screenshotAvailable ? (
                <Btn
                  variant="soft"
                  className="shrink-0"
                  disabled={openingId === run.id || busy}
                  onClick={() => onOpenScreenshot(run.id)}
                >
                  {openingId === run.id ? 'Открываем…' : 'Открыть скриншот'}
                </Btn>
              ) : null}
            </div>
          ))}
        </div>
      )}
      {openError && <p className="mt-3 text-sm font-semibold text-clay">{openError}</p>}
    </Card>
  )
}
