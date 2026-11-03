import type { AnalyticsDto } from '@vises/contracts';
import type { User } from '../../database/entities/user.entity';
import type { AnalyticsDateRange, AnalyticsPagination } from '../types';

export interface IAnalyticsService {
  getRolesApplications(
    actor: User,
    dateRange: AnalyticsDateRange | null,
    pagination: AnalyticsPagination,
    agentQ: string,
  ): Promise<AnalyticsDto>;
}
