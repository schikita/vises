import type { BlsHttpWorkflowGraph } from '../types/bls-http-workflow-graph.types';
import type { BlsHttpWorkflowOut } from '../types/bls-http-workflow-api.types';
import { hasBlsHttpWorkflowLiveNonStaleLock } from './has-bls-http-workflow-live-non-stale-lock.util';

/**
 * Map loaded workflow graph to staff snapshot DTO (no secrets / lockOwner).
 */
export const mapBlsHttpWorkflowGraphToOut = (
  graph: BlsHttpWorkflowGraph,
  nowMs: number = Date.now(),
): BlsHttpWorkflowOut => {
  const { workflow, steps, tasks } = graph;
  const stepKeyById = new Map(steps.map((s) => [s.id, s.stepKey]));

  return {
    workflowId: workflow.id,
    applicationId: workflow.applicationId,
    status: workflow.status,
    currentStepKey: workflow.currentStepKey,
    currentTaskKey: workflow.currentTaskKey,
    nextRunAt: workflow.nextRunAt ? workflow.nextRunAt.toISOString() : null,
    lockHeld: hasBlsHttpWorkflowLiveNonStaleLock({
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
