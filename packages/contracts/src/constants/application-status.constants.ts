/**
 * BUSINESS application statuses and §4.C transition matrix (FR-11 / FR-13).
 * No TypeScript enum — runtime values via `as const`.
 *
 * Actor `agent` on staff transitions means the owning agent (enforced at runtime).
 * Actor `visa_center_monitor` is the retained monitor identity (not a StaffRole).
 * Actor `system` is portal autofill / BLS workflow (not a StaffRole).
 */
export const APPLICATION_STATUSES = [
  'filling',
  'draft',
  'not_ready_for_appointment',
  'ready_for_appointment',
  'booked',
  'declined',
] as const;

export const APPLICATION_STATUS_TRANSITION_MATRIX = [
  {
    source: 'draft',
    target: 'filling',
    actors: ['system', 'admin', 'superadmin', 'agent'],
  },
  {
    source: 'filling',
    target: 'draft',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'filling',
    target: 'not_ready_for_appointment',
    actors: ['system', 'admin', 'superadmin', 'agent'],
  },
  {
    source: 'draft',
    target: 'not_ready_for_appointment',
    actors: ['admin', 'superadmin', 'agent', 'visa_center_monitor'],
  },
  {
    source: 'not_ready_for_appointment',
    target: 'filling',
    actors: ['system', 'admin', 'superadmin', 'agent'],
  },
  {
    source: 'not_ready_for_appointment',
    target: 'ready_for_appointment',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'ready_for_appointment',
    target: 'not_ready_for_appointment',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'ready_for_appointment',
    target: 'booked',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'booked',
    target: 'ready_for_appointment',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'draft',
    target: 'declined',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'filling',
    target: 'declined',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'not_ready_for_appointment',
    target: 'declined',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'ready_for_appointment',
    target: 'declined',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'booked',
    target: 'declined',
    actors: ['admin', 'superadmin', 'agent'],
  },
  {
    source: 'declined',
    target: 'not_ready_for_appointment',
    actors: ['admin', 'superadmin', 'agent'],
  },
] as const;
