import type { BlsClientResult, BlsClientTaskContext } from '../types';

/**
 * BOOK domain client (REQ-020 / CON-006 / DEC-011).
 * Open booking UI and stop for staff — no payment / VisaType submit here.
 */
export interface BlsBookingClient {
  execute(context: BlsClientTaskContext): Promise<BlsClientResult>;
}
