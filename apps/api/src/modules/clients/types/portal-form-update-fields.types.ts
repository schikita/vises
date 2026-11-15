import type { ClientPortalFormConditionals } from '@vises/contracts';
import type { ClientPortalFormStringFieldKey } from './client-portal-form-string-field-key.types';

/** Defined portal-form fields picked from a PATCH body (partial update). */
export type PortalFormUpdateFields = Partial<
  Record<ClientPortalFormStringFieldKey, string> & {
    portalFormConditionals: ClientPortalFormConditionals;
  }
>;
