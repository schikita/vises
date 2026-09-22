import { useCallback, useEffect, useRef, useState } from 'react'
import type { BlsWorkflowSnapshot } from '@/entities/bls-workflow'
import {
  BLS_WORKFLOW_POLL_INTERVAL_MS,
  cancelBlsWorkflow,
  fetchBlsWorkflow,
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
  startBlsWorkflow,
} from '@/entities/bls-workflow'
import { BlsWorkflowPanelRender } from './BlsWorkflowPanelRender'
import type { BlsWorkflowPanelProps } from './types'

export const BlsWorkflowPanel = ({ applicationId }: BlsWorkflowPanelProps) => {
  const [snapshot, setSnapshot] = useState<BlsWorkflowSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const pollInFlightRef = useRef(false)

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true
      if (silent) {
        if (pollInFlightRef.current) return
        pollInFlightRef.current = true
        setPolling(true)
      }

      try {
        const next = await fetchBlsWorkflow(applicationId)
        setSnapshot(next)
        setError('')
      } catch (err: unknown) {
        if (!silent) {
          setSnapshot(null)
          setError(
            err instanceof Error ? err.message : 'Не удалось загрузить сценарий BLS',
          )
        }
      } finally {
        if (silent) {
          pollInFlightRef.current = false
          setPolling(false)
        }
      }
    },
    [applicationId],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setActionError('')
    void fetchBlsWorkflow(applicationId)
      .then((next) => {
        if (cancelled) return
        setSnapshot(next)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setSnapshot(null)
        setError(
          err instanceof Error ? err.message : 'Не удалось загрузить сценарий BLS',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [applicationId])

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
        err instanceof Error ? err.message : 'Не удалось выполнить команду',
      )
    } finally {
      setBusy(false)
    }
  }

  const currentTask = snapshot ? findBlsWorkflowCurrentTask(snapshot) : null
  const safeError = snapshot ? findBlsWorkflowSafeError(snapshot) : null
  const hasActive = snapshot != null && isBlsWorkflowStatusActive(snapshot.status)
  const hasTerminalOrNone =
    snapshot == null || isBlsWorkflowStatusTerminal(snapshot.status)

  return (
    <BlsWorkflowPanelRender
      loading={loading}
      busy={busy}
      polling={polling && shouldPoll}
      error={error}
      actionError={actionError}
      snapshot={snapshot}
      currentAttempt={currentTask?.attemptCount ?? null}
      safeError={safeError}
      canStart={hasTerminalOrNone && !busy}
      canStartSupersede={hasActive && !busy}
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
        void runControl(() => startBlsWorkflow(applicationId))
      }}
      onStartSupersede={() => {
        void runControl(() =>
          startBlsWorkflow(applicationId, { supersede: true }),
        )
      }}
      onRetry={() => {
        if (!snapshot) return
        void runControl(() =>
          retryBlsWorkflow(applicationId, snapshot.workflowId),
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
    />
  )
}
