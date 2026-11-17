/**
 * Statuses that make an app visit-eligible even without visitDate (REQ-008).
 * BUSINESS: legacy `done` maps to `booked` (DEC-TERMINAL).
 */
export const VISIT_ELIGIBLE_STATUSES = ['booked'] as const;
