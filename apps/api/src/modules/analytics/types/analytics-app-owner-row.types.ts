/** Application → owning agent row for analytics (DEC-ASAU-003 / DEC-ASAU-009). */
export type AnalyticsAppOwnerRow = {
  applicationId: string;
  agentId: string;
  paymentPaid: boolean;
  /** Whole currency units from `Application.paymentAmount`. */
  paymentAmount: number;
  submitCity: string;
  visitDate: string;
  /** `Application.createdAt` for period filtering. */
  createdAt: Date;
};
