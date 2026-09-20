/** True when captcha Verified-loop budget deadline has elapsed. */
export const isPortalAutofillCaptchaBudgetExhausted = (
  captchaBudgetDeadlineAt: Date | null | undefined,
  nowMs: number,
): boolean =>
  captchaBudgetDeadlineAt != null &&
  nowMs >= captchaBudgetDeadlineAt.getTime();
