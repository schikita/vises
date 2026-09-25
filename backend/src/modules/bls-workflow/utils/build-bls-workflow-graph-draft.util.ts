import { BLS_WORKFLOW_STEP_ORDER } from '../constants/bls-workflow.constants';
import type { BlsWorkflowGraphDraft } from '../types/bls-workflow-graph.types';
import type { BlsWorkflowStepKey } from '../types/bls-workflow.types';
import { buildBlsWorkflowStepTaskDrafts } from './build-bls-workflow-step-task-drafts.util';

/**
 * Build ordered step/task draft graph for an application (REQ-002 / REQ-003 / DEC-009).
 * STATUS_VALIDATE gets one sequential task per applicant id.
 */
export const buildBlsWorkflowGraphDraft = (input: {
  applicantIds: string[];
}): BlsWorkflowGraphDraft => ({
  steps: BLS_WORKFLOW_STEP_ORDER.map((stepKey, index) => ({
    stepKey: stepKey as BlsWorkflowStepKey,
    ordinal: index + 1,
    tasks: buildBlsWorkflowStepTaskDrafts({
      stepKey: stepKey as BlsWorkflowStepKey,
      applicantIds: input.applicantIds,
    }),
  })),
});
