import {
  BLS_WORKFLOW_STEP_KEY,
  BLS_WORKFLOW_TASK_KEY,
} from '../constants/bls-http-workflow.constants';
import type { BlsHttpWorkflowTaskDraft } from '../types/bls-http-workflow-graph.types';
import type { BlsHttpWorkflowStepKey } from '../types/bls-http-workflow.types';

/** Draft sequential tasks for one workflow step (REQ-003 / DEC-009). */
export const buildBlsHttpWorkflowStepTaskDrafts = (input: {
  stepKey: BlsHttpWorkflowStepKey;
  applicantIds: string[];
}): BlsHttpWorkflowTaskDraft[] => {
  const { stepKey, applicantIds } = input;
  if (stepKey === BLS_WORKFLOW_STEP_KEY.REGISTER) {
    return [
      {
        taskKey: BLS_WORKFLOW_TASK_KEY.REGISTER_SUBMIT,
        applicantId: null,
        ordinal: 1,
      },
    ];
  }
  if (stepKey === BLS_WORKFLOW_STEP_KEY.LOGIN) {
    return [
      {
        taskKey: BLS_WORKFLOW_TASK_KEY.LOGIN_AUTH,
        applicantId: null,
        ordinal: 1,
      },
    ];
  }
  if (stepKey === BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE) {
    return [
      {
        taskKey: BLS_WORKFLOW_TASK_KEY.PASSWORD_CHANGE,
        applicantId: null,
        ordinal: 1,
      },
    ];
  }
  if (stepKey === BLS_WORKFLOW_STEP_KEY.STATUS_VALIDATE) {
    return applicantIds.map((applicantId, index) => ({
      taskKey: BLS_WORKFLOW_TASK_KEY.STATUS_APPLICANT,
      applicantId,
      ordinal: index + 1,
    }));
  }
  return [
    {
      taskKey: BLS_WORKFLOW_TASK_KEY.BOOK_OPEN,
      applicantId: null,
      ordinal: 1,
    },
  ];
};
