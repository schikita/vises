export const mailTmSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
