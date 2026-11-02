import type { BlsHttpWorkflowGraph } from '../types/bls-http-workflow-graph.types';
import type { StartBlsHttpWorkflowOut } from '../types/bls-http-workflow-api.types';

/** Map created workflow graph to short POST start response (REQ-023). */
export const mapBlsHttpWorkflowToStartOut = (
  graph: BlsHttpWorkflowGraph,
): StartBlsHttpWorkflowOut => ({
  workflowId: graph.workflow.id,
  status: graph.workflow.status,
  applicationId: graph.workflow.applicationId,
});
