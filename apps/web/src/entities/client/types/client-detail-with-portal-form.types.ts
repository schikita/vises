import type {
  ClientDetailDto,
  ClientPortalFormDetailDto,
} from '@vises/contracts'

/**
 * GET /clients/:clientId with FR-6 plaintext plus portal-form fields.
 * Mirrors Nest `ClientDetailWithPortalFormDto` (contracts keep shapes separate).
 */
export type ClientDetailWithPortalForm = ClientDetailDto &
  ClientPortalFormDetailDto
