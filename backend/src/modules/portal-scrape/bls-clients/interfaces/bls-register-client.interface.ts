import type { BlsClientResult, BlsClientTaskContext } from '../types';

/**
 * REGISTER domain client (REQ-009 / REQ-010 / DEC-019).
 * Owns Patchright page actions; orchestrator must not embed selectors (DEC-008).
 */
export interface BlsRegisterClient {
  execute(context: BlsClientTaskContext): Promise<BlsClientResult>;
}
