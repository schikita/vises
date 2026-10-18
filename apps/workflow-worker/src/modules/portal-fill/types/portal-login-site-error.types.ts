/**
 * Site-processing danger-alert probe (portal-login-site-error DEC-003 / DEC-005).
 */

/** Result of `detectPortalLoginSiteProcessingAlert`. */
export type PortalLoginSiteProcessingAlertProbeResult = {
  present: boolean;
  /** Trimmed visible alert text (non-secret UI copy). */
  alertText?: string;
};

/**
 * Optional three-way signature (password + captcha block + processing alert)
 * for logging notes (REQ-002). Alert-alone still blocks auth (REQ-003).
 */
export type PortalLoginSiteFailureSignatureResult = {
  present: boolean;
  /** `full` when password + captcha block + alert; else `alert_shell`. */
  signature?: 'full' | 'alert_shell';
  alertText?: string;
  passwordPresent?: boolean;
  captchaBlockPresent?: boolean;
};
