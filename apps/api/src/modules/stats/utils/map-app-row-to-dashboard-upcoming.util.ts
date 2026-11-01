import type { Application } from '../../database/entities/application.entity';
import type { DashboardUpcomingVisit } from '../types/dashboard-upcoming-visit.types';

/** Map application entity → slim upcoming-visit DTO. */
export const mapAppRowToDashboardUpcoming = (
  row: Application,
): DashboardUpcomingVisit => {
  // T2: applicants jsonb removed; Client lastName arrives via T8/T10.
  return {
    id: row.id,
    code: row.code,
    visitDate: row.visitDate,
    visitTime: row.visitTime,
    status: row.status,
    primaryLastName: '',
  };
};
