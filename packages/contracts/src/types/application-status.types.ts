import { APPLICATION_STATUS_TRANSITION_MATRIX } from '../constants/application-status.constants';

/**
 * BUSINESS application status union (FR-11 / §4.A). No enum.
 * Replaces legacy drafting/pending/rejected/issued.
 */
export type ApplicationStatus =
  | 'filling'
  | 'draft'
  | 'not_ready_for_appointment'
  | 'ready_for_appointment'
  | 'booked'
  | 'declined';

/**
 * Actors allowed on a status transition (§4.C).
 * `visa_center_monitor` is a system monitor identity, not a StaffRole.
 * `system` is portal autofill / BLS workflow (not a StaffRole).
 * `agent` means the owning agent (ownership checked at runtime).
 */
export type ApplicationStatusTransitionActor =
  | 'superadmin'
  | 'admin'
  | 'agent'
  | 'visa_center_monitor'
  | 'system';

/**
 * Frozen §4.C transition matrix type (FR-11 / FR-13).
 * Derived from `APPLICATION_STATUS_TRANSITION_MATRIX`.
 */
export type ApplicationStatusTransitionMatrix =
  typeof APPLICATION_STATUS_TRANSITION_MATRIX;

export type ApplicationStatusTransition =
  ApplicationStatusTransitionMatrix[number];
