export const consentModalSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
