/** Fixed delay helper for Verified settle / captcha-service transient backoff (no jitter). */
export const portalCaptchaVerifiedLoopSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
