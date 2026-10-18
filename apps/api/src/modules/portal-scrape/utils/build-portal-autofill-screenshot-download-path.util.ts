/**
 * Staff download locator for a captured evidence PNG (DEC-003 / DEC-001 list).
 * Same path pattern as AutofillEvidence.downloadPath.
 */
export const buildPortalAutofillScreenshotDownloadPath = (
  runId: string,
): string => `/api/apps/portal-autofill-runs/${runId}/screenshot`;
