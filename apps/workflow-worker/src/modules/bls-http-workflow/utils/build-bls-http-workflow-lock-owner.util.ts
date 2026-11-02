import { uid } from '../../../shared/utils';

/** Opaque executor lock owner token for a durable BLS workflow (REQ-005 / DEC-003). */
export const buildBlsHttpWorkflowLockOwner = (): string => uid('bls-lock');
