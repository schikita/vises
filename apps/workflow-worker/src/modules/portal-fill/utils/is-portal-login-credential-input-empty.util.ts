/**
 * Treat whitespace-only control values as empty (DEC-003).
 */
export const isPortalLoginCredentialInputEmpty = (value: string): boolean =>
  value.trim() === '';
