/**
 * "Back to client" is for an application that already has a person on it,
 * or has moved past the blank registration draft.
 */
export const shouldShowPortalFormClientLink = (
  applicationId: string,
  applicationStatus: string,
  hasSavedName: boolean,
): boolean =>
  applicationId.trim().length > 0 &&
  (hasSavedName || applicationStatus !== 'draft')
