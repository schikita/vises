import type { ApplicationStatus } from '@vises/contracts';

/** History event used to derive effective status / receivedAt / bookedAt. */
export type AnalyticsHistoryEvent = {
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  createdAt: Date;
};
