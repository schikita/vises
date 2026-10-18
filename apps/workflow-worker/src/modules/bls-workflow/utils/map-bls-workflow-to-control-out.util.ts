import type { BlsWorkflowGraph } from '../types/bls-workflow-graph.types';
import type { BlsWorkflowControlOut } from '../types/bls-workflow-api.types';

/** Map workflow graph to short control-plane response (retry/resume/pause/cancel). */
export const mapBlsWorkflowToControlOut = (
  graph: BlsWorkflowGraph,
): BlsWorkflowControlOut => ({
  workflowId: graph.workflow.id,
  status: graph.workflow.status,
  nextRunAt: graph.workflow.nextRunAt
    ? graph.workflow.nextRunAt.toISOString()
    : null,
});
