import type {
  ClientDetailDto,
  ClientPortalFormDetailDto,
} from '@vises/contracts';

/**
 * GET client detail with FR-6 plaintext plus portal-form fields (DEC-004).
 * Contracts keep the shapes separate; Nest intersects for one FE-ready read.
 */
export type ClientDetailWithPortalFormDto = ClientDetailDto &
  ClientPortalFormDetailDto;
