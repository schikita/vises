import type { BlsWorkflowSafeError, BlsWorkflowSnapshot } from '@/entities/bls-workflow'

export type BlsWorkflowPanelProps = {
  applicationId: string
}

export type BlsWorkflowPanelRenderProps = {
  loading: boolean
  busy: boolean
  polling: boolean
  error: string
  actionError: string
  snapshot: BlsWorkflowSnapshot | null
  currentAttempt: number | null
  safeError: BlsWorkflowSafeError | null
  canStart: boolean
  canStartSupersede: boolean
  canRetry: boolean
  canResume: boolean
  canPause: boolean
  canCancel: boolean
  onStart: () => void
  onStartSupersede: () => void
  onRetry: () => void
  onResume: () => void
  onPause: () => void
  onCancel: () => void
}
