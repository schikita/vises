/** Sleep helper for browser-mail poll loops (one util per file). */
export const browserMailSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
