import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@/app/providers'
import type { PortalAutofillRunListItem } from '@/entities/portal-autofill'
import {
  isPortalAutofillApplicantReady,
  resolveCrmStatusAfterPortalAutofill,
} from '@/entities/portal-autofill'
import { PortalAutofillEvidenceSectionRender } from './PortalAutofillEvidenceSectionRender'
import type { PortalAutofillEvidenceSectionProps } from './types'
import { formatRunFeedback } from './utils'

export const PortalAutofillEvidenceSection = ({
  applicationId,
  applicants,
  persistedApplicantIds,
  clientEmail,
}: PortalAutofillEvidenceSectionProps) => {
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
  const [runFeedbackIsError, setRunFeedbackIsError] = useState(false)
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

  const refreshRuns = async () => {
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

  const openScreenshot = async (runId: string) => {
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

  const startAutofill = async () => {
    if (busy || !selectedApplicant || !canStart) return

    setBusy(true)
    setRunFeedback('')
    setRunFeedbackIsError(false)
    setStatusFeedback('')
    setOpenError('')

    try {
      const result = await runPortalAutofill(applicationId, selectedApplicant.id)
      setRunFeedback(formatRunFeedback(result))
      setRunFeedbackIsError(!result.report)

      const crm = resolveCrmStatusAfterPortalAutofill(result)
      if (crm != null) {
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
    <PortalAutofillEvidenceSectionRender
      applicants={applicants}
      effectiveApplicantId={effectiveApplicantId}
      ready={ready}
      applicantPersisted={applicantPersisted}
      canStart={canStart}
      busy={busy}
      loading={loading}
      error={error}
      openError={openError}
      openingId={openingId}
      runFeedback={runFeedback}
      runFeedbackIsError={runFeedbackIsError}
      statusFeedback={statusFeedback}
      runs={runs}
      onSelectApplicant={setSelectedApplicantId}
      onStartAutofill={() => void startAutofill()}
      onOpenScreenshot={(runId) => void openScreenshot(runId)}
    />
  )
}
