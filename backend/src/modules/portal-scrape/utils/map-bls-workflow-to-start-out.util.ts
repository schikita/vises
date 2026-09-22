import type { BlsWorkflowGraph } from '../types/bls-workflow-graph.types';
import type { StartBlsWorkflowOut } from '../types/bls-workflow-api.types';

/** Map created workflow graph to short POST start response (REQ-023). */
export const mapBlsWorkflowToStartOut = (
  graph: BlsWorkflowGraph,
): StartBlsWorkflowOut => ({
  workflowId: graph.workflow.id,
  status: graph.workflow.status,
  applicationId: graph.workflow.applicationId,
});
