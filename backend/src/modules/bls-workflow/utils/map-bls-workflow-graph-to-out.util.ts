import type { BlsWorkflowGraph } from '../types/bls-workflow-graph.types';
import type { BlsWorkflowOut } from '../types/bls-workflow-api.types';
import { hasBlsWorkflowLiveNonStaleLock } from './has-bls-workflow-live-non-stale-lock.util';

/**
 * Map loaded workflow graph to staff snapshot DTO (no secrets / lockOwner).
 */
export const mapBlsWorkflowGraphToOut = (
  graph: BlsWorkflowGraph,
  nowMs: number = Date.now(),
): BlsWorkflowOut => {
  const { workflow, steps, tasks } = graph;
  const stepKeyById = new Map(steps.map((s) => [s.id, s.stepKey]));

  return {
    workflowId: workflow.id,
    applicationId: workflow.applicationId,
    status: workflow.status,
    currentStepKey: workflow.currentStepKey,
    currentTaskKey: workflow.currentTaskKey,
    nextRunAt: workflow.nextRunAt ? workflow.nextRunAt.toISOString() : null,
    lockHeld: hasBlsWorkflowLiveNonStaleLock({
      lockOwner: workflow.lockOwner,
      lockHeartbeatAt: workflow.lockHeartbeatAt,
      nowMs,
    }),
    terminalReason: workflow.terminalReason,
    steps: steps.map((s) => ({
      stepKey: s.stepKey,
      ordinal: s.ordinal,
      status: s.status,
      skipReason: s.skipReason,
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      stepKey: stepKeyById.get(t.stepId) ?? '',
      taskKey: t.taskKey,
      applicantId: t.applicantId,
      ordinal: t.ordinal,
      status: t.status,
      attemptCount: t.attemptCount,
      maxAttempts: t.maxAttempts,
      lastErrorClass: t.lastErrorClass,
      lastErrorMessage: t.lastErrorMessage,
    })),
    updatedAt: workflow.updatedAt.toISOString(),
  };
};
