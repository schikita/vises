/** Sleep helper for Webshare list 429 backoff (NFR-001). */
export const webshareListSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
