/**
 * When true (captcha-service-enabled path), captcha id/class/text clues do not
 * abort (DEC-005 / REQ-011). Login wall still aborts.
 */
export type DetectBlockingPageOptions = {
  ignoreCaptchaClues?: boolean;
};
