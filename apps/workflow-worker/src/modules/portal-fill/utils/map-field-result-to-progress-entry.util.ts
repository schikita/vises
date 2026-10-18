import {
  PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS,
} from '../constants';
import type {
  FieldResult,
  PortalAutofillFieldProgressEntry,
} from '../types';

/**
 * Map a fill FieldResult to a durable progress entry without the value (REQ-005 / REQ-013).
 */
export const mapFieldResultToProgressEntry = (
  field: FieldResult,
): PortalAutofillFieldProgressEntry => {
  const status =
    field.status === 'filled'
      ? PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS.FILLED
      : field.status === 'skipped'
        ? PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS.SKIPPED
        : PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS.FAILED;

  const reason =
    typeof field.reason === 'string' && field.reason.trim().length > 0
      ? field.reason.slice(0, 200)
      : undefined;

  return reason !== undefined ? { status, reason } : { status };
};
