import type {
  ClientDetailDto,
  ClientPortalFormDetailDto,
} from '@vises/contracts'

/**
 * GET /clients/:clientId — FR-6 plaintext detail ∩ portal-form fields
 * (API `ClientDetailWithPortalFormDto`). Includes journey/contact:
 * phone, purpose, firstEntry, entries, durationDays (OQ-PF-001).
 */
export type ClientDetailWithPortalForm = ClientDetailDto &
  ClientPortalFormDetailDto
