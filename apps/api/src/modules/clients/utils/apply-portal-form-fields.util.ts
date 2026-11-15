import type { Client } from '../../database/entities/client.entity';
import { CLIENT_PORTAL_FORM_STRING_FIELD_KEYS } from '../constants/client-portal-form-field-keys.constants';
import type { PortalFormUpdateFields } from '../types/portal-form-update-fields.types';

/** Apply picked portal-form fields onto a Client entity (only keys present). */
export const applyPortalFormFields = (
  client: Client,
  fields: PortalFormUpdateFields,
): void => {
  for (const key of CLIENT_PORTAL_FORM_STRING_FIELD_KEYS) {
    if (!(key in fields)) {
      continue;
    }
    const value = fields[key];
    if (value === undefined) {
      continue;
    }
    client[key] = value;
  }
  if (
    'portalFormConditionals' in fields &&
    fields.portalFormConditionals !== undefined
  ) {
    client.portalFormConditionals = fields.portalFormConditionals;
  }
};
