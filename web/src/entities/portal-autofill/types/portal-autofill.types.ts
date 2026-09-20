/** Portal autofill capture outcome (mirrors backend list DTO; not CRM Status). */
export type PortalAutofillCaptureStatus = 'captured' | 'capture_failed'

/** Durable run lifecycle (mirrors backend; null = legacy evidence-only). */
export type PortalAutofillRunStatus =
  | 'in_progress'
  | 'succeeded'
  | 'failed'
  | 'abandoned'

/** CapMonster CB state as returned on staff list items. */
export type PortalAutofillCapMonsterCbState = 'closed' | 'open' | 'half-open'

/** Aggregate fill counts (no field values). */
export type PortalFieldProgressSummary = {
  filled: number
  skipped: number
  failed: number
}

/** Staff-safe CapMonster / captcha flags (REQ-007). */
export type PortalAutofillCaptchaSummary = {
  cbState: PortalAutofillCapMonsterCbState | null
  permanentFailed: boolean
  budgetExhausted: boolean
}

/** Server-computed retry mode for the pair (DEC-008). */
export type PortalAutofillRetryImpliedMode =
  | 'resume'
  | 'start_new'
  | 'supersede'
  | 'none'

export type PortalAutofillRetryEligibility = {
  canResume: boolean
  canStartOrSupersede: boolean
  captchaRetryViaNewRun: boolean
  blockedReasonRu: string | null
  impliedMode: PortalAutofillRetryImpliedMode
}

/** Staff list item from GET /apps/:applicationId/portal-autofill-runs (DEC-007). */
export type PortalAutofillRunListItem = {
  id: string
  applicationId: string
  applicantId: string
  createdAt: string
  captureStatus: PortalAutofillCaptureStatus
  reportOk: boolean
  errorNote: string | null
  screenshotAvailable: boolean
  /** Absolute API path when a PNG was captured; otherwise null */
  downloadPath: string | null
  status: PortalAutofillRunStatus | null
  pipelineStage: string | null
  fieldProgressSummary: PortalFieldProgressSummary | null
  terminalReason: string | null
  captcha: PortalAutofillCaptchaSummary
}

export type PortalAutofillRunListResponse = {
  runs: PortalAutofillRunListItem[]
  retryEligibility: PortalAutofillRetryEligibility
  eligibilityApplicantId: string | null
}

/** Options for POST …/portal-autofill (DEC-008). */
export type PortalAutofillRunOptions = {
  supersede?: boolean
}

/** Minimal autofill report shape from POST …/portal-autofill (200/422/502 body). */
export type AutofillReportSummary = {
  ok: boolean
  applicationId: string
  applicantId: string
  summary?: {
    filled: number
    skipped: number
    failed: number
  }
  generatedAt?: string
  evidence?: {
    runId: string
    captureOk: boolean
    downloadPath?: string
    error?: string
  }
}

/** Result of store.runPortalAutofill (DEC-006): keep report body on 422/502. */
export type PortalAutofillRunResult = {
  httpStatus: number
  report?: AutofillReportSummary
  message?: string
}

/**
 * CRM status after staff portal autofill settles with a fill report.
 * Resolver returns `null` when CRM must stay unchanged (no report, or failure).
 * Success may nudge `review` only — never auto-`declined` (REQ-012 / DEC-003).
 */
export type PortalAutofillCrmOutcome = {
  status: 'review'
  note: string
}

/** Client-safe portal send state (REQ-003). */
export type PortalClientPortalSendState =
  | 'not_started'
  | 'in_progress'
  | 'attempted'
  | 'succeeded'
  | 'failed'

export type PortalSiteOutcome =
  | { state: 'not_available' }
  | { state: 'approved' | 'rejected' | 'unknown'; detail?: string }

/** Client-safe portal progress on application read (REQ-002–005 / DEC-007). */
export type PortalClientPortalProgress = {
  dataSaved: boolean
  portalSend: PortalClientPortalSendState
  fillSummary: PortalFieldProgressSummary | null
  siteOutcome: PortalSiteOutcome
}
