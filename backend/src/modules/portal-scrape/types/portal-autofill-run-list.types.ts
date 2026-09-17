import type { PortalAutofillCaptureStatus } from '../constants';

/**
 * Staff list item for portal autofill runs (DEC-001).
 * Does not expose `relativePath` / filesystem internals.
 */
export type PortalAutofillRunListItem = {
  id: string;
  applicationId: string;
  applicantId: string;
  /** ISO-8601 timestamp */
  createdAt: string;
  captureStatus: PortalAutofillCaptureStatus;
  reportOk: boolean;
  errorNote: string | null;
  screenshotAvailable: boolean;
  /** Absolute API path when a PNG was captured; otherwise null */
  downloadPath: string | null;
};

export type PortalAutofillRunListResponse = {
  runs: PortalAutofillRunListItem[];
};
