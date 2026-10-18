/** Sleep helper for Proxy6 rate-limit spacing and 429 backoff (DEC-008). */
export const proxy6Sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
