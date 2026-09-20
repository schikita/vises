import type { OwnerDashboardStatsOut } from '../types';

export interface IStatsService {
  getDashboard(rangeDays?: number): Promise<OwnerDashboardStatsOut>;
}
