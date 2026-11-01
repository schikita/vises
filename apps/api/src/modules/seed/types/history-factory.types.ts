import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';

export type HistoryFactory = {
  create: (data: Partial<ApplicationStatusHistory>) => ApplicationStatusHistory;
};
