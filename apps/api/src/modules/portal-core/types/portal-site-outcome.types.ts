/**
 * Site approval / outcome projection (REQ-005 / DEC-002).
 * Belarus-now always uses `not_available` until an adapter probe exists.
 */
export type PortalSiteOutcomeState =
  | 'not_available'
  | 'approved'
  | 'rejected'
  | 'unknown';

export type PortalSiteOutcome =
  | { state: 'not_available' }
  | { state: 'approved' | 'rejected' | 'unknown'; detail?: string };
