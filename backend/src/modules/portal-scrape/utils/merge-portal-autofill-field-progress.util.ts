import type {
  PortalAutofillFieldProgressEntry,
  PortalAutofillFieldProgressMap,
} from '../types';

/**
 * Merge one field progress entry into the map (REQ-005).
 * Overwrites the same field name; does not store values.
 */
export const mergePortalAutofillFieldProgress = (
  current: PortalAutofillFieldProgressMap | null | undefined,
  fieldName: string,
  entry: PortalAutofillFieldProgressEntry,
): PortalAutofillFieldProgressMap => ({
  ...(current ?? {}),
  [fieldName]: entry,
});
