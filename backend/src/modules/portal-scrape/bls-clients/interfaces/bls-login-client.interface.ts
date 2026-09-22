import type { BlsClientResult, BlsClientTaskContext } from '../types';

/**
 * LOGIN domain client (REQ-011).
 * Owns login-prep + password submit page actions (DEC-008).
 */
export interface BlsLoginClient {
  execute(context: BlsClientTaskContext): Promise<BlsClientResult>;
}
