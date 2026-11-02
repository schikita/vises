import { BLS_WORKFLOW_STEP_ORDER } from '../constants/bls-http-workflow.constants';
import type { BlsHttpWorkflowGraphDraft } from '../types/bls-http-workflow-graph.types';
import type { BlsHttpWorkflowStepKey } from '../types/bls-http-workflow.types';
import { buildBlsHttpWorkflowStepTaskDrafts } from './build-bls-http-workflow-step-task-drafts.util';

/**
 * Build ordered step/task draft graph for an application (REQ-002 / REQ-003 / DEC-009).
 * STATUS_VALIDATE gets one sequential task per applicant id.
 */
export const buildBlsHttpWorkflowGraphDraft = (input: {
  applicantIds: string[];
}): BlsHttpWorkflowGraphDraft => ({
  steps: BLS_WORKFLOW_STEP_ORDER.map((stepKey, index) => ({
    stepKey: stepKey as BlsHttpWorkflowStepKey,
    ordinal: index + 1,
    tasks: buildBlsHttpWorkflowStepTaskDrafts({
      stepKey: stepKey as BlsHttpWorkflowStepKey,
      applicantIds: input.applicantIds,
    }),
  })),
});
