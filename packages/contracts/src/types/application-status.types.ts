import { APPLICATION_STATUS_TRANSITION_MATRIX } from '../constants/application-status.constants';

/**
 * Application status union (FR-7.1 / AC-12 / NFR-9). No enum.
 */
export type ApplicationStatus =
  | 'drafting'
  | 'pending'
  | 'rejected'
  | 'booked'
  | 'issued';

/**
 * Actors allowed on a status transition (FR-7.4).
 * `visa_center_monitor` is a system identity, not a StaffRole.
 * `agent` means the owning agent (ownership checked at runtime).
 */
export type ApplicationStatusTransitionActor =
  | 'superadmin'
  | 'admin'
  | 'agent'
  | 'visa_center_monitor';

/**
 * Frozen FR-7.4 transition matrix type (AC-12 / AC-14).
 * Derived from `APPLICATION_STATUS_TRANSITION_MATRIX`.
 */
export type ApplicationStatusTransitionMatrix =
  typeof APPLICATION_STATUS_TRANSITION_MATRIX;

export type ApplicationStatusTransition =
  ApplicationStatusTransitionMatrix[number];
