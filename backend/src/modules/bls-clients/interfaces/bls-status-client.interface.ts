import type { BlsClientResult, BlsClientTaskContext } from '../types';

/**
 * STATUS_VALIDATE domain client (REQ-018 / REQ-019).
 * Scrape / normalize applicant status; UNKNOWN ≠ success (DEC-008).
 */
export interface BlsStatusClient {
  execute(context: BlsClientTaskContext): Promise<BlsClientResult>;
}
