/**
 * Staff portal credentials reveal (portal-credential-reveal DEC-001 / DEC-008).
 * Intentional secrets exception — snapshot/events remain secret-free.
 */

export type BlsPortalCredentialsOut = {
  applicationId: string;
  workflowId: string;
  /** Application.portalFormEmail only — never CRM clientEmail. */
  portalFormEmail: string;
  /**
   * First portal login password from the post-registration email (6 digits).
   * Vault purpose PORTAL_PASSWORD_INITIAL (`bls_secret_vault`).
   */
  portalPasswordInitial: string;
  /**
   * Current portal login password (PORTAL_PASSWORD in `bls_secret_vault`).
   * Same as initial until PASSWORD_CHANGE succeeds; then the generated new password.
   */
  portalPassword: string;
};

export type RevealBlsPortalCredentialsInput = {
  applicationId: string;
  workflowId: string;
  actorUserId: string;
};
