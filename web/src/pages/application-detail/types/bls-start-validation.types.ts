import type { ApplicantFieldsSection } from '@/features/application-form'
import type { ApplicationDetailTabId } from './application-detail-tabs.types'

/** Section chrome that owns Start-relevant date fields (REQ-007). */
export type ApplicationDetailStartIssueSection = Extract<
  ApplicantFieldsSection,
  'personal' | 'documents'
>

/** One operator-facing Start validation issue (aggregate Dialog line). */
export type ApplicationDetailStartIssue = {
  message: string
  /** Present for client form gate; omitted for API residual Dialog lines (DEC-006). */
  tabId?: Extract<ApplicationDetailTabId, 'applicants' | 'trip'>
  applicantIndex?: number
  section?: ApplicationDetailStartIssueSection
}

export type ApplicationDetailStartValidationDialogState = {
  open: boolean
  issues: ApplicationDetailStartIssue[]
}
