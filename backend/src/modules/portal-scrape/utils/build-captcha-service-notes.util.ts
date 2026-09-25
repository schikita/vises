/**
 * Captcha-service outcome notes for autofill reports (REQ-009 / DEC-011).
 * Never include API key or image base64 (NFR-004).
 * Capability wording only — concrete provider names stay in adapters.
 */
export const buildCaptchaServiceNotes = (
  fill: {
    captchaAttempted?: boolean;
    captchaOk?: boolean;
    error?: string;
  },
  captchaServiceApiKey: string | undefined,
): string[] => {
  if (!captchaServiceApiKey) {
    return ['captcha service: not configured'];
  }
  if (fill.captchaOk === true) {
    return ['captcha service: succeeded'];
  }
  if (fill.captchaAttempted === true) {
    const reason = (fill.error ?? 'unknown').trim() || 'unknown';
    return [`captcha service: failed: ${reason}`];
  }
  return ['captcha service: not attempted'];
};
