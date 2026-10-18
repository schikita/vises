/** Outcome of best-effort post–Update Password settle (DEC-002 / DEC-003). */
export type SettlePortalPageAfterPasswordChangeSubmitResult = {
  settled: boolean;
  via: 'domcontentloaded' | 'timeout' | 'error' | 'unavailable';
};
