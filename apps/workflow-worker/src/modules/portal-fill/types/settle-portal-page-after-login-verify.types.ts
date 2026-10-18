/** Outcome of best-effort post–login-Verify settle (DEC-001). */
export type SettlePortalPageAfterLoginVerifyResult = {
  settled: boolean;
  via: 'domcontentloaded' | 'timeout' | 'error' | 'unavailable';
};
