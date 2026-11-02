import type {
  BlsHttpWorkflowApplicantLabelSource,
  BlsHttpWorkflowEvent,
  BlsHttpWorkflowSafeError,
  BlsHttpWorkflowSnapshot,
} from '@/entities/bls-http-workflow'
import type { BeforeStartBlsHttpWorkflow } from './bls-start-before-gate.types'
import type { OnStartBlsHttpWorkflowApiError } from './bls-start-api-error.types'

export type BlsHttpWorkflowPanelProps = {
  applicationId: string
  /** Optional CRM applicants for REQ-011 Should labels (DEC-004). */
  applicants?: BlsHttpWorkflowApplicantLabelSource[]
  /** Opens RegisterUser screenshot for AUTOFILL_RUN_LINKED (DEC-007). */
  onAutofillRunLinked?: (runId: string) => void | Promise<void>
  /**
   * Parent pre-gate before start/supersede API (embedded mode).
   * When omitted (standalone page), the panel starts via the engine's own
   * `POST /apps/:id/bls-http-workflow/start` — the server-side start gate
   * (completeness + travel date) still applies.
   */
  onBeforeStartBlsHttpWorkflow?: BeforeStartBlsHttpWorkflow
  /**
   * Parent opens shared Dialog for start/supersede API `detail` (DEC-006).
   * Pause/resume/retry/cancel do not use this (REQ-014).
   */
  onStartBlsHttpWorkflowApiError?: OnStartBlsHttpWorkflowApiError
  /**
   * Detail-owned Start Completeness/date signal for chrome / a11y.
   * Does **not** disable Start — click always runs `onBeforeStartBlsHttpWorkflow`
   * (full form check) before any start API call.
   */
  startFormBlocked?: boolean
}

export type BlsHttpWorkflowPanelRenderProps = {
  loading: boolean
  busy: boolean
  polling: boolean
  error: string
  actionError: string
  /** Polite aria-live announcement (status / current step / state) — NFR-004. */
  liveStatusText: string
  snapshot: BlsHttpWorkflowSnapshot | null
  events: BlsHttpWorkflowEvent[]
  applicants?: BlsHttpWorkflowApplicantLabelSource[]
  currentTaskId: string | null
  currentAttempt: number | null
  safeError: BlsHttpWorkflowSafeError | null
  /** True when the portal account exists but its password is not vaulted. */
  needsPortalPassword: boolean
  credPassword: string
  credBusy: boolean
  credError: string
  credSaved: boolean
  onCredPasswordChange: (value: string) => void
  onSavePortalPassword: () => void
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
