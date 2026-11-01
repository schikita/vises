import type {
  ApplicationStatus,
  ApplicationStatusTransitionActor,
} from './application-status.types';

/**
 * Wire-only history actor role (T15.1 / Decision 2A).
 * `"unknown"` is for unrecognized persisted DB values — not a transition-matrix actor.
 */
export type ApplicationStatusHistoryActorRole =
  | ApplicationStatusTransitionActor
  | 'unknown';

/**
 * Append-only status history row (FR-7 / AC-12 / NFR-4).
 * No passport or other plaintext PII; actor is id + role only.
 * `createdAt` is ISO-8601 on the wire (same convention as ApplicationDto).
 */
export type ApplicationStatusHistoryDto = {
  id: string;
  /** Null for the first history row when no prior status exists. */
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  /** Staff user id, or null when actor is a system identity. */
  actorId: string | null;
  /**
   * Staff matrix actor, system identity (`visa_center_monitor`), or `"unknown"`
   * when the persisted role is not a known ApplicationStatusTransitionActor.
   * Do not add `"unknown"` to the transition matrix.
   */
  actorRole: ApplicationStatusHistoryActorRole;
  /** Null when the transition was recorded without a trigger label. */
  trigger: string | null;
  reason?: string;
  /** ISO-8601 timestamp */
  createdAt: string;
};

/**
 * Status history list response (FR-7 / §6.6).
 */
export type ApplicationStatusHistoryResponseDto = {
  items: ApplicationStatusHistoryDto[];
};
