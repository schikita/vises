import type { BlsWorkflowTaskExecutorResult } from '../../types/bls-workflow-runner.types';

/**
 * Structured domain-client outcome — mirrors executor result so the dispatcher
 * can return client results unchanged (REQ-007 verify gate stays on runner).
 */
export type BlsClientResult = BlsWorkflowTaskExecutorResult;
