/** Agent monetary balance row for analytics (DEC-ASAU-003 / NFR-002). */
export type AnalyticsAgentBalanceRow = {
  agentId: string;
  /** `User.balance` as decimal string; callers normalize null to `"0.00"`. */
  balance: string;
};
