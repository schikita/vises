import type { Status } from '@/entities/application'

/** Portal autofill capture outcome (mirrors backend list DTO; not CRM Status). */
export type PortalAutofillCaptureStatus = 'captured' | 'capture_failed'

/** Staff list item from GET /apps/:applicationId/portal-autofill-runs (DEC-001). */
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
}

export type PortalAutofillRunListResponse = {
  runs: PortalAutofillRunListItem[]
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
 * Resolver returns `null` when there is no report (skip setStatus).
 */
export type PortalAutofillCrmOutcome = {
  status: Extract<Status, 'review' | 'declined'>
  note: string
}
