import type { BlsHttpWorkflowGraph } from '../types/bls-http-workflow-graph.types';
import type { BlsHttpWorkflowControlOut } from '../types/bls-http-workflow-api.types';

/** Map workflow graph to short control-plane response (retry/resume/pause/cancel). */
export const mapBlsHttpWorkflowToControlOut = (
  graph: BlsHttpWorkflowGraph,
): BlsHttpWorkflowControlOut => ({
  workflowId: graph.workflow.id,
  status: graph.workflow.status,
  nextRunAt: graph.workflow.nextRunAt
    ? graph.workflow.nextRunAt.toISOString()
    : null,
});
