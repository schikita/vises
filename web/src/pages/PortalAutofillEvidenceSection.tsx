import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import type { Applicant, PortalAutofillRunListItem } from '../types'
import {
  formatDateTime,
  isPortalAutofillApplicantReady,
  portalCaptureStatusLabel,
  portalReportOkLabel,
  resolveCrmStatusAfterPortalAutofill,
} from '../types'
import { Btn, Card, Empty, Field } from '../ui'

type PortalAutofillEvidenceSectionProps = {
  applicationId: string
  applicants: Applicant[]
  /** Applicant ids from last successful store/upsert snapshot (DEC-003). */
  persistedApplicantIds: string[]
  clientEmail: string
}

function applicantOptionLabel(person: Applicant) {
  const name = `${person.firstName} ${person.lastName}`.trim() || 'Без имени'
  const shortId = person.id.length > 8 ? person.id.slice(-6) : person.id
  return `${name} (${shortId})`
}

function formatRunFeedback(result: {
  httpStatus: number
  report?: { ok: boolean; evidence?: { captureOk: boolean; error?: string } }
  message?: string
}): string {
  const parts: string[] = []
  if (result.report) {
    parts.push(portalReportOkLabel(result.report.ok))
    if (result.report.evidence) {
      parts.push(
        result.report.evidence.captureOk
          ? portalCaptureStatusLabel('captured')
          : portalCaptureStatusLabel('capture_failed'),
      )
      if (result.report.evidence.error) parts.push(result.report.evidence.error)
    }
  } else if (result.message) {
    parts.push(result.message)
  } else if (result.httpStatus === 0) {
    parts.push('Не удалось выполнить запрос автозаполнения (сеть или таймаут)')
  } else {
    parts.push(`Ответ сервера: ${result.httpStatus}`)
  }
  return parts.join(' · ')
}

export function PortalAutofillEvidenceSection({
  applicationId,
  applicants,
  persistedApplicantIds,
  clientEmail,
}: PortalAutofillEvidenceSectionProps) {
  const {
    listPortalAutofillRuns,
    openPortalAutofillScreenshot,
    runPortalAutofill,
    setStatus,
  } = useStore()
  const [runs, setRuns] = useState<PortalAutofillRunListItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openError, setOpenError] = useState('')
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [runFeedback, setRunFeedback] = useState('')
  const [statusFeedback, setStatusFeedback] = useState('')

  const effectiveApplicantId =
    selectedApplicantId && applicants.some((a) => a.id === selectedApplicantId)
      ? selectedApplicantId
      : (applicants[0]?.id ?? '')

  const selectedApplicant = useMemo(
    () => applicants.find((a) => a.id === effectiveApplicantId) ?? applicants[0],
    [applicants, effectiveApplicantId],
  )
  const ready = isPortalAutofillApplicantReady(selectedApplicant, clientEmail)
  const applicantPersisted = Boolean(
    selectedApplicant?.id && persistedApplicantIds.includes(selectedApplicant.id),
  )
  const canStart = ready && applicantPersisted && Boolean(selectedApplicant)

  async function refreshRuns() {
    const next = await listPortalAutofillRuns(applicationId)
    setRuns(next)
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setOpenError('')
    void listPortalAutofillRuns(applicationId)
      .then((next) => {
        if (!cancelled) setRuns(next)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRuns(null)
          setError(err instanceof Error ? err.message : 'Не удалось загрузить запуски')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [applicationId, listPortalAutofillRuns])

  async function openScreenshot(runId: string) {
    setOpenError('')
    setOpeningId(runId)
    try {
      await openPortalAutofillScreenshot(runId)
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : 'Не удалось открыть скриншот')
    } finally {
      setOpeningId(null)
    }
  }

  async function startAutofill() {
    if (busy || !selectedApplicant || !canStart) return

    setBusy(true)
    setRunFeedback('')
    setStatusFeedback('')
    setOpenError('')

    try {
      const result = await runPortalAutofill(applicationId, selectedApplicant.id)
      setRunFeedback(formatRunFeedback(result))

      const crm = resolveCrmStatusAfterPortalAutofill(result)
      try {
        const updated = await setStatus(applicationId, crm.status, crm.note)
        setStatusFeedback(
          updated
            ? crm.note
            : 'Не удалось обновить статус заявки (заявка не найдена в списке)',
        )
      } catch (err: unknown) {
        setStatusFeedback(
          err instanceof Error ? err.message : 'Не удалось обновить статус заявки',
        )
      }

      try {
        await refreshRuns()
        setError('')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Не удалось обновить список запусков')
      }
    } finally {
      setBusy(false)
    }
  }

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
              onChange={(e) => setSelectedApplicantId(e.target.value)}
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
          После запуска: при успешном заполнении и скриншоте статус станет «На рассмотрении», иначе
          — «Отклонено». Статус можно изменить вручную выше.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Btn disabled={!canStart || busy} onClick={() => void startAutofill()}>
            {busy ? 'Выполняется автозаполнение…' : 'Запустить автозаполнение'}
          </Btn>
        </div>

        {busy && (
          <p className="text-sm font-semibold text-muted">Выполняется автозаполнение… Это может занять минуту.</p>
        )}
        {runFeedback && !busy && <p className="text-sm font-semibold">{runFeedback}</p>}
        {statusFeedback && !busy && <p className="text-sm font-semibold">{statusFeedback}</p>}
      </div>

      {loading && <p className="text-sm text-muted">Загружаем запуски…</p>}
      {!loading && error && <p className="text-sm font-semibold text-clay">{error}</p>}
      {!loading && !error && runs && runs.length === 0 && (
        <Empty title="Пока нет запусков" text="После автозаполнения здесь появятся статус и скриншоты." />
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
                <p className="text-sm font-semibold">{portalCaptureStatusLabel(run.captureStatus)}</p>
                <p className="text-sm">{portalReportOkLabel(run.reportOk)}</p>
                {run.errorNote ? <p className="text-xs font-semibold text-clay">{run.errorNote}</p> : null}
              </div>
              {run.screenshotAvailable ? (
                <Btn
                  variant="soft"
                  className="shrink-0"
                  disabled={openingId === run.id || busy}
                  onClick={() => void openScreenshot(run.id)}
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
