/** Fixed delay helper for Verified settle / CapMonster transient backoff (no jitter). */
export const portalCaptchaVerifiedLoopSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
