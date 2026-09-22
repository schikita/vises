import type { BlsWorkflowTaskExecutorInput } from '../../types/bls-workflow-runner.types';

/**
 * Shared context passed from the workflow executor into domain BLS clients.
 * Same shape as the runner executor input (DEC-008) — clients own page work only.
 */
export type BlsClientTaskContext = BlsWorkflowTaskExecutorInput;
