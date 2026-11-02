import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  BlsHttpWorkflowEvent,
  BlsHttpWorkflowSnapshot,
} from '@/entities/bls-http-workflow'
import {
  BLS_WORKFLOW_EVENTS_MAX_LIMIT,
  BLS_WORKFLOW_POLL_INTERVAL_MS,
  blsWorkflowStatusLabel,
  blsWorkflowStepKeyLabel,
  cancelBlsHttpWorkflow,
  fetchBlsHttpWorkflow,
  fetchBlsHttpWorkflowEvents,
  findBlsHttpWorkflowCurrentTask,
  findBlsHttpWorkflowSafeError,
  isBlsHttpWorkflowCancelEligible,
  isBlsHttpWorkflowPauseEligible,
  isBlsHttpWorkflowResumeEligible,
  isBlsHttpWorkflowRetryEligible,
  isBlsHttpWorkflowStatusActive,
  isBlsHttpWorkflowStatusTerminal,
  pauseBlsHttpWorkflow,
  resumeBlsHttpWorkflow,
  retryBlsHttpWorkflow,
  setBlsHttpWorkflowPortalPassword,
  startBlsHttpWorkflow,
} from '@/entities/bls-http-workflow'
import { BlsHttpWorkflowPanelRender } from './BlsHttpWorkflowPanelRender'
import {
  BLS_WORKFLOW_PANEL_COPY as copy,
  BLS_WORKFLOW_POLL_SLOW_INDICATOR_MS,
} from './constants'
import type { BlsHttpWorkflowPanelProps } from './types'
import { buildBlsHttpWorkflowLiveStatusText } from './utils'

export const BlsHttpWorkflowPanel = ({
  applicationId,
  applicants,
  onAutofillRunLinked,
  onBeforeStartBlsHttpWorkflow,
  onStartBlsHttpWorkflowApiError,
  startFormBlocked = false,
}: BlsHttpWorkflowPanelProps) => {
  const [snapshot, setSnapshot] = useState<BlsHttpWorkflowSnapshot | null>(null)
  const [events, setEvents] = useState<BlsHttpWorkflowEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [credPassword, setCredPassword] = useState('')
  const [credBusy, setCredBusy] = useState(false)
  const [credError, setCredError] = useState('')
  const [credSaved, setCredSaved] = useState(false)
  const pollInFlightRef = useRef(false)
  const pollSlowTimerRef = useRef<number | null>(null)
  const sinceEventIdRef = useRef(0)
  const workflowIdWatchRef = useRef<string | null>(null)
  const eventsRef = useRef<BlsHttpWorkflowEvent[]>([])
  const eventsFetchGenRef = useRef(0)
  const applicationIdRef = useRef(applicationId)

  useEffect(() => {
    applicationIdRef.current = applicationId
  }, [applicationId])

  const clearPollSlowIndicator = useCallback(() => {
    if (pollSlowTimerRef.current != null) {
      window.clearTimeout(pollSlowTimerRef.current)
      pollSlowTimerRef.current = null
    }
    setPolling(false)
  }, [])

  useEffect(() => {
    return () => {
      if (pollSlowTimerRef.current != null) {
        window.clearTimeout(pollSlowTimerRef.current)
        pollSlowTimerRef.current = null
      }
    }
  }, [])

  const resetEventsCursor = useCallback(() => {
    eventsFetchGenRef.current += 1
    sinceEventIdRef.current = 0
    workflowIdWatchRef.current = null
    eventsRef.current = []
    setEvents([])
  }, [])

  const pullEvents = useCallback(
    async (workflowId: string) => {
      if (workflowIdWatchRef.current !== workflowId) {
        workflowIdWatchRef.current = workflowId
        sinceEventIdRef.current = 0
        eventsRef.current = []
        setEvents([])
      }

      const gen = eventsFetchGenRef.current
      const cursor = sinceEventIdRef.current
      const page = await fetchBlsHttpWorkflowEvents(applicationId, workflowId, {
        sinceEventId: cursor,
      })
      if (eventsFetchGenRef.current !== gen) return

      const fresh = page.events.filter((event) => event.id > cursor)
      const merged = [...eventsRef.current, ...fresh]
      const nextEvents =
        merged.length <= BLS_WORKFLOW_EVENTS_MAX_LIMIT
          ? merged
          : merged.slice(merged.length - BLS_WORKFLOW_EVENTS_MAX_LIMIT)
      eventsRef.current = nextEvents
      setEvents(nextEvents)
      if (page.latestEventId != null) {
        sinceEventIdRef.current = page.latestEventId
      }
    },
    [applicationId],
  )

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true
      const requestApplicationId = applicationId
      if (silent) {
        if (pollInFlightRef.current) return
        pollInFlightRef.current = true
        // Only surface “Обновляем статус…” when a poll stays in flight > 3s.
        if (pollSlowTimerRef.current != null) {
          window.clearTimeout(pollSlowTimerRef.current)
        }
        pollSlowTimerRef.current = window.setTimeout(() => {
          pollSlowTimerRef.current = null
          setPolling(true)
        }, BLS_WORKFLOW_POLL_SLOW_INDICATOR_MS)
      }

      try {
        const next = await fetchBlsHttpWorkflow(requestApplicationId)
        if (applicationIdRef.current !== requestApplicationId) return

        setSnapshot(next)
        setError('')

        if (next?.workflowId) {
          try {
            await pullEvents(next.workflowId)
          } catch {
            // Events poll failure is silent — retain last good snapshot + events (NFR-003).
          }
        } else {
          resetEventsCursor()
        }
      } catch (err: unknown) {
        if (applicationIdRef.current !== requestApplicationId) return
        if (!silent) {
          setSnapshot(null)
          resetEventsCursor()
          setError(
            err instanceof Error ? err.message : copy.loadErrorFallback,
          )
        }
      } finally {
        if (silent) {
          pollInFlightRef.current = false
          clearPollSlowIndicator()
        }
      }
    },
    [applicationId, clearPollSlowIndicator, pullEvents, resetEventsCursor],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setActionError('')
    resetEventsCursor()

    void fetchBlsHttpWorkflow(applicationId)
      .then(async (next) => {
        if (cancelled) return
        setSnapshot(next)
        if (!next?.workflowId) return
        try {
          await pullEvents(next.workflowId)
        } catch {
          // Retain snapshot; events stay empty / last good.
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setSnapshot(null)
        resetEventsCursor()
        setError(
          err instanceof Error ? err.message : copy.loadErrorFallback,
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [applicationId, pullEvents, resetEventsCursor])

  const shouldPoll =
    snapshot != null && !isBlsHttpWorkflowStatusTerminal(snapshot.status)

  useEffect(() => {
    if (!shouldPoll || busy) return
    const id = window.setInterval(() => {
      void refresh({ silent: true })
    }, BLS_WORKFLOW_POLL_INTERVAL_MS)
    return () => {
      window.clearInterval(id)
    }
  }, [shouldPoll, busy, refresh])

  const runControl = async (action: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true)
    setActionError('')
    try {
      await action()
      await refresh()
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : copy.actionErrorFallback,
      )
    } finally {
      setBusy(false)
    }
  }

  /**
   * Start / supersede. Embedded mode (legacy panel): parent gate + apps-upsert
   * arm (DEC-015). Standalone mode (this copy, no gate prop): dedicated
   * POST /apps/:id/bls-http-workflow/start of the parallel HTTP engine.
   * Busy covers gate + persist so a second click cannot skip validation.
   */
  const runStartWithFormGate = async (supersede: boolean) => {
    if (busy) return
    setBusy(true)
    setActionError('')
    try {
      if (onBeforeStartBlsHttpWorkflow) {
        const allowed = await onBeforeStartBlsHttpWorkflow({ supersede })
        if (!allowed) {
          return
        }
      } else {
        await startBlsHttpWorkflow(applicationId, { supersede })
      }
      await refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : copy.actionErrorFallback
      setActionError(message)
      if (message.trim()) {
        onStartBlsHttpWorkflowApiError?.(message)
      }
    } finally {
      setBusy(false)
    }
  }

  const currentTask = snapshot ? findBlsHttpWorkflowCurrentTask(snapshot) : null
  const safeError = snapshot ? findBlsHttpWorkflowSafeError(snapshot) : null
  const needsPortalPassword = safeError?.errorCode === 'bls_register_password_unresolvable'

  /**
   * Staff records the portal password for an already-registered portal
   * account, then retries the blocked task so the flow proceeds (reuse path).
   */
  const savePortalPassword = async () => {
    if (credBusy || !snapshot) return
    const password = credPassword.trim()
    if (password.length < 8) {
      setCredError('Пароль портала — минимум 8 символов')
      return
    }
    setCredBusy(true)
    setCredError('')
    try {
      await setBlsHttpWorkflowPortalPassword(applicationId, password)
      setCredPassword('')
      setCredSaved(true)
      await retryBlsHttpWorkflow(applicationId, snapshot.workflowId).catch(() => undefined)
      await refresh()
    } catch (err: unknown) {
      setCredError(err instanceof Error ? err.message : copy.actionErrorFallback)
    } finally {
      setCredBusy(false)
    }
  }

  const hasActive = snapshot != null && isBlsHttpWorkflowStatusActive(snapshot.status)
  const hasTerminalOrNone =
    snapshot == null || isBlsHttpWorkflowStatusTerminal(snapshot.status)

  const retryableTaskIds = new Set(
    snapshot == null || busy
      ? []
      : snapshot.tasks
          .filter(
            (task) =>
              Boolean(task.id) &&
              isBlsHttpWorkflowRetryEligible({
                workflowStatus: snapshot.status,
                taskStatus: task.status,
              }),
          )
          .map((task) => task.id),
  )

  const isPolling = polling && shouldPoll
  const liveStatusText = buildBlsHttpWorkflowLiveStatusText({
    loading,
    error,
    actionError,
    empty: !loading && !error && snapshot == null,
    statusLabel: snapshot ? blsWorkflowStatusLabel(snapshot.status) : null,
    currentStepLabel: snapshot?.currentStepKey
      ? blsWorkflowStepKeyLabel(snapshot.currentStepKey)
      : null,
    polling: isPolling,
  })

  return (
    <BlsHttpWorkflowPanelRender
      loading={loading}
      busy={busy}
      polling={isPolling}
      error={error}
      actionError={actionError}
      liveStatusText={liveStatusText}
      snapshot={snapshot}
      events={events}
      applicants={applicants}
      currentTaskId={currentTask?.id ?? null}
      currentAttempt={currentTask?.attemptCount ?? null}
      safeError={safeError}
      needsPortalPassword={needsPortalPassword === true}
      credPassword={credPassword}
      credBusy={credBusy}
      credError={credError}
      credSaved={credSaved}
      onCredPasswordChange={(value) => {
        setCredPassword(value)
        setCredSaved(false)
      }}
      onSavePortalPassword={() => {
        void savePortalPassword()
      }}
      retryableTaskIds={retryableTaskIds}
      canStart={hasTerminalOrNone && !busy}
      canStartSupersede={hasActive && !busy}
      startFormBlocked={startFormBlocked}
      canRetry={
        snapshot != null &&
        !busy &&
        isBlsHttpWorkflowRetryEligible({
          workflowStatus: snapshot.status,
          taskStatus: currentTask?.status ?? null,
        })
      }
      canResume={
        snapshot != null && !busy && isBlsHttpWorkflowResumeEligible(snapshot.status)
      }
      canPause={
        snapshot != null && !busy && isBlsHttpWorkflowPauseEligible(snapshot.status)
      }
      canCancel={
        snapshot != null && !busy && isBlsHttpWorkflowCancelEligible(snapshot.status)
      }
      onStart={() => {
        void runStartWithFormGate(false)
      }}
      onStartSupersede={() => {
        void runStartWithFormGate(true)
      }}
      onRetry={() => {
        if (!snapshot) return
        // Default retry: omit taskId — backend picks current failed/waiting task.
        void runControl(() =>
          retryBlsHttpWorkflow(applicationId, snapshot.workflowId),
        )
      }}
      onRetryTask={(taskId) => {
        if (!snapshot || !taskId) return
        void runControl(() =>
          retryBlsHttpWorkflow(applicationId, snapshot.workflowId, { taskId }),
        )
      }}
      onResume={() => {
        if (!snapshot) return
        void runControl(() =>
          resumeBlsHttpWorkflow(applicationId, snapshot.workflowId),
        )
      }}
      onPause={() => {
        if (!snapshot) return
        void runControl(() =>
          pauseBlsHttpWorkflow(applicationId, snapshot.workflowId),
        )
      }}
      onCancel={() => {
        if (!snapshot) return
        void runControl(() =>
          cancelBlsHttpWorkflow(applicationId, snapshot.workflowId),
        )
      }}
      onAutofillRunLinked={
        onAutofillRunLinked
          ? (runId) => {
              void (async () => {
                try {
                  setActionError('')
                  await onAutofillRunLinked(runId)
                } catch (err: unknown) {
                  setActionError(
                    err instanceof Error && err.message
                      ? err.message
                      : copy.screenshotOpenErrorFallback,
                  )
                }
              })()
            }
          : undefined
      }
    />
  )
}
