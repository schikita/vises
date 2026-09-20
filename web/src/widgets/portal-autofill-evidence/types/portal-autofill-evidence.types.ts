import type { Applicant } from '@/entities/application'
import type { PortalAutofillRunListItem } from '@/entities/portal-autofill'

export type PortalAutofillEvidenceSectionProps = {
  applicationId: string
  applicants: Applicant[]
  /** Applicant ids from last successful store/upsert snapshot (DEC-003). */
  persistedApplicantIds: string[]
  clientEmail: string
}

export type PortalAutofillRunFeedbackInput = {
  httpStatus: number
  report?: { ok: boolean; evidence?: { captureOk: boolean; error?: string } }
  message?: string
}

export type PortalAutofillEvidenceSectionRenderProps = {
  applicants: Applicant[]
  effectiveApplicantId: string
  ready: boolean
  applicantPersisted: boolean
  /** Local readiness + persistence allow attempting a trigger. */
  localCanTrigger: boolean
  /** Server eligibility allows the action (DEC-008). */
  actionEligible: boolean
  actionLabel: string
  blockedReasonRu: string | null
  busy: boolean
  loading: boolean
  error: string
  openError: string
  openingId: string | null
  runFeedback: string
  /** True when settle had no fill report (proxy/config/auth/network) — clay emphasis. */
  runFeedbackIsError: boolean
  statusFeedback: string
  runs: PortalAutofillRunListItem[] | null
  onSelectApplicant: (applicantId: string) => void
  onStartAutofill: () => void
  onOpenScreenshot: (runId: string) => void
}
