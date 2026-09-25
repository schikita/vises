import type {
  BlsWorkflowApplicantLabelSource,
  BlsWorkflowEvent,
  BlsWorkflowSafeError,
  BlsWorkflowSnapshot,
} from '@/entities/bls-workflow'
import type { BeforeStartBlsWorkflow } from './bls-start-before-gate.types'
import type { OnStartBlsWorkflowApiError } from './bls-start-api-error.types'

export type BlsWorkflowPanelProps = {
  applicationId: string
  /** Optional CRM applicants for REQ-011 Should labels (DEC-004). */
  applicants?: BlsWorkflowApplicantLabelSource[]
  /** Opens RegisterUser screenshot for AUTOFILL_RUN_LINKED (DEC-007). */
  onAutofillRunLinked?: (runId: string) => void | Promise<void>
  /**
   * Parent pre-gate before start/supersede API.
   * **Required** for a successful start: panel fails closed if missing.
   * Must run full Start-schema form validation and return `false` to block the network call.
   */
  onBeforeStartBlsWorkflow?: BeforeStartBlsWorkflow
  /**
   * Parent opens shared Dialog for start/supersede API `detail` (DEC-006).
   * Pause/resume/retry/cancel do not use this (REQ-014).
   */
  onStartBlsWorkflowApiError?: OnStartBlsWorkflowApiError
  /**
   * Detail-owned Start Completeness/date signal for chrome / a11y.
   * Does **not** disable Start — click always runs `onBeforeStartBlsWorkflow`
   * (full form check) before any start API call.
   */
  startFormBlocked?: boolean
}

export type BlsWorkflowPanelRenderProps = {
  loading: boolean
  busy: boolean
  polling: boolean
  error: string
  actionError: string
  /** Polite aria-live announcement (status / current step / state) — NFR-004. */
  liveStatusText: string
  snapshot: BlsWorkflowSnapshot | null
  events: BlsWorkflowEvent[]
  applicants?: BlsWorkflowApplicantLabelSource[]
  currentTaskId: string | null
  currentAttempt: number | null
  safeError: BlsWorkflowSafeError | null
  /** Task ids eligible for targeted retry (`{ taskId }`). */
  retryableTaskIds: ReadonlySet<string>
  canStart: boolean
  canStartSupersede: boolean
  /** Detail Start Completeness/date signal (chrome/a11y); Start click still runs full gate. */
  startFormBlocked: boolean
  canRetry: boolean
  canResume: boolean
  canPause: boolean
  canCancel: boolean
  onStart: () => void
  onStartSupersede: () => void
  /** Toolbar default retry — omit `taskId` (backend default). */
  onRetry: () => void
  /** Per-row targeted retry — body `{ taskId }`. */
  onRetryTask: (taskId: string) => void
  onResume: () => void
  onPause: () => void
  onCancel: () => void
  onAutofillRunLinked?: (runId: string) => void | Promise<void>
}
