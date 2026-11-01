import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import type { AnalyticsHistoryEvent } from '../types';

export const mapHistoryRowToEvent = (
  row: Pick<
    ApplicationStatusHistory,
    'applicationId' | 'fromStatus' | 'toStatus' | 'createdAt'
  >,
): AnalyticsHistoryEvent => ({
  applicationId: row.applicationId,
  fromStatus: row.fromStatus,
  toStatus: row.toStatus,
  createdAt: row.createdAt,
});
