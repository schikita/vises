import type { BlsClientResult, BlsClientTaskContext } from '../types';

/**
 * PASSWORD_CHANGE domain client (REQ-012 / REQ-013).
 * Detect forced change UI or signal SKIPPED to orchestrator (DEC-008).
 */
export interface BlsPasswordChangeClient {
  execute(context: BlsClientTaskContext): Promise<BlsClientResult>;
}
