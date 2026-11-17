import type { AnalyticsDto } from '@vises/contracts';
import type { User } from '../../database/entities/user.entity';
import type { AnalyticsDateRange } from '../types';

export interface IAnalyticsService {
  getRolesApplications(
    actor: User,
    dateRange: AnalyticsDateRange | null,
  ): Promise<AnalyticsDto>;
}
