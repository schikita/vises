import {
  BLS_WORKFLOW_STEP_KEY,
  BLS_WORKFLOW_TASK_KEY,
} from '../../bls-workflow/constants/bls-workflow.constants';
import type { BlsDomainClientKind } from '../types';

/**
 * Map workflow step/task keys onto a domain client kind (DEC-008).
 * Prefers taskKey; falls back to stepKey. Returns null when unmapped.
 */
export const resolveBlsDomainClientKind = (input: {
  stepKey: string;
  taskKey: string;
}): BlsDomainClientKind | null => {
  switch (input.taskKey) {
    case BLS_WORKFLOW_TASK_KEY.REGISTER_SUBMIT:
      return 'register';
    case BLS_WORKFLOW_TASK_KEY.LOGIN_AUTH:
      return 'login';
    case BLS_WORKFLOW_TASK_KEY.PASSWORD_CHANGE:
      return 'password_change';
    case BLS_WORKFLOW_TASK_KEY.STATUS_APPLICANT:
      return 'status';
    case BLS_WORKFLOW_TASK_KEY.BOOK_OPEN:
      return 'booking';
    default:
      break;
  }

  switch (input.stepKey) {
    case BLS_WORKFLOW_STEP_KEY.REGISTER:
      return 'register';
    case BLS_WORKFLOW_STEP_KEY.LOGIN:
      return 'login';
    case BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE:
      return 'password_change';
    case BLS_WORKFLOW_STEP_KEY.STATUS_VALIDATE:
      return 'status';
    case BLS_WORKFLOW_STEP_KEY.BOOK:
      return 'booking';
    default:
      return null;
  }
};
