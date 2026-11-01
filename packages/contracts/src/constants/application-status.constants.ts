/**
 * Application statuses and FR-7.4 transition matrix (AC-12 / AC-14 / NFR-9).
 * No TypeScript enum — runtime values via `as const`.
 *
 * Actor `agent` on staff transitions means the owning agent (enforced at runtime).
 * Actor `visa_center_monitor` is the system monitor identity (not a StaffRole).
 */
export const APPLICATION_STATUSES = [
  'drafting',
  'pending',
  'rejected',
  'booked',
  'issued',
] as const;

export const APPLICATION_STATUS_TRANSITION_MATRIX = [
  {
    source: 'drafting',
    target: 'pending',
    actors: ['visa_center_monitor'],
  },
  {
    source: 'pending',
    target: 'rejected',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'pending',
    target: 'booked',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'booked',
    target: 'issued',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'booked',
    target: 'pending',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'rejected',
    target: 'pending',
    actors: ['admin', 'superadmin', 'agent'],
  },
] as const;
