/** Result of authenticated-landing probe after password submit (REQ-011). */
export type PortalLoginAuthVerifyResult = {
  ok: boolean;
  /**
   * Success: `login_form_absent`.
   * Failure site-processing: `site_processing_error` (portal-login-site-error DEC-004).
   */
  via?: 'login_form_absent' | 'site_processing_error' | string;
  reason?: string;
  /** Visible processing-alert text when `via === 'site_processing_error'`. */
  alertText?: string;
};
