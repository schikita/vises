/**
 * Vault secret purpose on `bls_secret_vault.purpose` (DEC-005).
 * Owned by bls-secrets (portal-scrape-module-split DEC-006).
 */

export const BLS_SECRET_PURPOSE = {
  /**
   * Current portal login password (after PASSWORD_CHANGE when that step ran;
   * otherwise the emailed 6-digit initial password).
   */
  PORTAL_PASSWORD: 'PORTAL_PASSWORD',
  /**
   * First portal login password from the post-registration email (6 digits).
   * Retained even after PASSWORD_CHANGE rotates PORTAL_PASSWORD.
   */
  PORTAL_PASSWORD_INITIAL: 'PORTAL_PASSWORD_INITIAL',
  MAILTM_PASSWORD: 'MAILTM_PASSWORD',
  MAILTM_TOKEN: 'MAILTM_TOKEN',
} as const;

/**
 * Vault purposes purged after Mail.tm grace only (portal-credential-reveal DEC-005).
 * Never includes PORTAL_PASSWORD or PORTAL_PASSWORD_INITIAL.
 */
export const BLS_SECRET_PURPOSE_MAILTM_CLEANUP = [
  BLS_SECRET_PURPOSE.MAILTM_PASSWORD,
  BLS_SECRET_PURPOSE.MAILTM_TOKEN,
] as const;
