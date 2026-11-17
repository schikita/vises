/**
 * Raw TypeORM `getRawMany` shape for analytics application ownership +
 * payment/city fields (ASAU-TASK-002).
 */
export type AnalyticsAppOwnerRawRow = {
  applicationId: string;
  agentId: string;
  paymentPaid: unknown;
  paymentAmount: unknown;
  submitCity: unknown;
  visitDate: unknown;
  createdAt: unknown;
};
