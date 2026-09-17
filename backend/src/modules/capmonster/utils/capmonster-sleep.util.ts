export const capMonsterSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
