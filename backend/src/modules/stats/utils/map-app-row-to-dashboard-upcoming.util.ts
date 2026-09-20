import type { Application } from '../../database/entities/application.entity';
import type { DashboardUpcomingVisit } from '../types/dashboard-upcoming-visit.types';

/** Map application entity → slim upcoming-visit DTO. */
export const mapAppRowToDashboardUpcoming = (
  row: Application,
): DashboardUpcomingVisit => {
  const primary = Array.isArray(row.applicants) ? row.applicants[0] : null;
  const lastName =
    primary &&
    typeof primary === 'object' &&
    primary !== null &&
    'lastName' in primary &&
    typeof (primary as { lastName: unknown }).lastName === 'string'
      ? (primary as { lastName: string }).lastName
      : '';
  return {
    id: row.id,
    code: row.code,
    visitDate: row.visitDate,
    visitTime: row.visitTime,
    status: row.status,
    primaryLastName: lastName,
  };
};
