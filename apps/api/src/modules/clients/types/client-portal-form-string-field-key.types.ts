import { CLIENT_PORTAL_FORM_STRING_FIELD_KEYS } from '../constants/client-portal-form-field-keys.constants';

/** CamelCase Client portal-form string column keys (APF / REQ-002 / DEC-002). */
export type ClientPortalFormStringFieldKey =
  (typeof CLIENT_PORTAL_FORM_STRING_FIELD_KEYS)[number];
