import { CLIENT_PORTAL_FORM_STRING_FIELD_KEYS } from '../constants/client-portal-form-field-keys.constants';
import type { ClientPortalFormUpdateDto } from '../dto/client-portal-form-update.dto';
import type { PortalFormUpdateFields } from '../types/portal-form-update-fields.types';

/** Pick defined portal-form body fields for a partial Client update. */
export const pickPortalFormUpdateFields = (
  body: ClientPortalFormUpdateDto,
): PortalFormUpdateFields => {
  const out: PortalFormUpdateFields = {};
  for (const key of CLIENT_PORTAL_FORM_STRING_FIELD_KEYS) {
    if (!(key in body)) {
      continue;
    }
    const value = body[key];
    if (value === undefined) {
      continue;
    }
    out[key] = value;
  }
  if (
    'portalFormConditionals' in body &&
    body.portalFormConditionals !== undefined
  ) {
    out.portalFormConditionals = body.portalFormConditionals;
  }
  return out;
};
