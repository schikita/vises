import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  BlsWorkflowEvent,
  BlsWorkflowSnapshot,
} from '@/entities/bls-workflow'
import {
  BLS_WORKFLOW_EVENTS_MAX_LIMIT,
  BLS_WORKFLOW_POLL_INTERVAL_MS,
  blsWorkflowStatusLabel,
  blsWorkflowStepKeyLabel,
  cancelBlsWorkflow,
  fetchBlsWorkflow,
  fetchBlsWorkflowEvents,
  findBlsWorkflowCurrentTask,
  findBlsWorkflowSafeError,
  isBlsWorkflowCancelEligible,
  isBlsWorkflowPauseEligible,
  isBlsWorkflowResumeEligible,
  isBlsWorkflowRetryEligible,
  isBlsWorkflowStatusActive,
  isBlsWorkflowStatusTerminal,
  pauseBlsWorkflow,
  resumeBlsWorkflow,
  retryBlsWorkflow,
} from '@/entities/bls-workflow'
import { BlsWorkflowPanelRender } from './BlsWorkflowPanelRender'
import {
  BLS_WORKFLOW_PANEL_COPY as copy,
  BLS_WORKFLOW_POLL_SLOW_INDICATOR_MS,
} from './constants'
import type { BlsWorkflowPanelProps } from './types'
import { buildBlsWorkflowLiveStatusText } from './utils'

export const BlsWorkflowPanel = ({
  applicationId,
  applicants,
  onAutofillRunLinked,
  onBeforeStartBlsWorkflow,
  onStartBlsWorkflowApiError,
  startFormBlocked = false,
}: BlsWorkflowPanelProps) => {
  const [snapshot, setSnapshot] = useState<BlsWorkflowSnapshot | null>(null)
  const [events, setEvents] = useState<BlsWorkflowEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const pollInFlightRef = useRef(false)
  const pollSlowTimerRef = useRef<number | null>(null)
  const sinceEventIdRef = useRef(0)
  const workflowIdWatchRef = useRef<string | null>(null)
  const eventsRef = useRef<BlsWorkflowEvent[]>([])
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
      const page = await fetchBlsWorkflowEvents(applicationId, workflowId, {
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
        const next = await fetchBlsWorkflow(requestApplicationId)
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

    void fetchBlsWorkflow(applicationId)
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
    snapshot != null && !isBlsWorkflowStatusTerminal(snapshot.status)

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
   * Start / supersede: parent gate + upsert arm (DEC-015). No dedicated start POST.
   * Busy covers gate + persist so a second click cannot skip validation.
   */
  const runStartWithFormGate = async (supersede: boolean) => {
    if (busy) return
    setBusy(true)
    setActionError('')
    try {
      if (!onBeforeStartBlsWorkflow) {
        setActionError(copy.startFormGateMissing)
        return
      }
      const allowed = await onBeforeStartBlsWorkflow({ supersede })
      if (!allowed) {
        return
      }
      await refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : copy.actionErrorFallback
      setActionError(message)
      if (message.trim()) {
        onStartBlsWorkflowApiError?.(message)
      }
    } finally {
      setBusy(false)
    }
  }

  const currentTask = snapshot ? findBlsWorkflowCurrentTask(snapshot) : null
  const safeError = snapshot ? findBlsWorkflowSafeError(snapshot) : null
  const hasActive = snapshot != null && isBlsWorkflowStatusActive(snapshot.status)
  const hasTerminalOrNone =
    snapshot == null || isBlsWorkflowStatusTerminal(snapshot.status)

  const retryableTaskIds = new Set(
    snapshot == null || busy
      ? []
      : snapshot.tasks
          .filter(
            (task) =>
              Boolean(task.id) &&
              isBlsWorkflowRetryEligible({
                workflowStatus: snapshot.status,
                taskStatus: task.status,
              }),
          )
          .map((task) => task.id),
  )

  const isPolling = polling && shouldPoll
  const liveStatusText = buildBlsWorkflowLiveStatusText({
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
    <BlsWorkflowPanelRender
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
      retryableTaskIds={retryableTaskIds}
      canStart={hasTerminalOrNone && !busy}
      canStartSupersede={hasActive && !busy}
      startFormBlocked={startFormBlocked}
      canRetry={
        snapshot != null &&
        !busy &&
        isBlsWorkflowRetryEligible({
          workflowStatus: snapshot.status,
          taskStatus: currentTask?.status ?? null,
        })
      }
      canResume={
        snapshot != null && !busy && isBlsWorkflowResumeEligible(snapshot.status)
      }
      canPause={
        snapshot != null && !busy && isBlsWorkflowPauseEligible(snapshot.status)
      }
      canCancel={
        snapshot != null && !busy && isBlsWorkflowCancelEligible(snapshot.status)
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
          retryBlsWorkflow(applicationId, snapshot.workflowId),
        )
      }}
      onRetryTask={(taskId) => {
        if (!snapshot || !taskId) return
        void runControl(() =>
          retryBlsWorkflow(applicationId, snapshot.workflowId, { taskId }),
        )
      }}
      onResume={() => {
        if (!snapshot) return
        void runControl(() =>
          resumeBlsWorkflow(applicationId, snapshot.workflowId),
        )
      }}
      onPause={() => {
        if (!snapshot) return
        void runControl(() =>
          pauseBlsWorkflow(applicationId, snapshot.workflowId),
        )
      }}
      onCancel={() => {
        if (!snapshot) return
        void runControl(() =>
          cancelBlsWorkflow(applicationId, snapshot.workflowId),
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
