import { shouldAbandonCapMonsterInflightTaskOnResume } from './should-abandon-capmonster-inflight-task-on-resume.util';
import type {
  PortalAutofillCapMonsterCbCheckpoint,
  PortalAutofillCaptchaRestore,
} from '../types';

/**
 * Build captcha restore input from a durable run row (DEC-003 / DEC-005).
 * Abandons in-flight captcha-service taskId and counts it toward attempts when present.
 */
export const buildPortalAutofillCaptchaRestore = (row: {
  captchaAttempt: number;
  captchaBudgetDeadlineAt: Date | null;
  capmonsterCbState: string | null;
  capmonsterCbConsecutiveFailures: number;
  capmonsterCbOpenedAt: Date | null;
  capmonsterInflightTaskId: string | null;
}): PortalAutofillCaptchaRestore => {
  const abandon = shouldAbandonCapMonsterInflightTaskOnResume(
    row.capmonsterInflightTaskId,
  );
  const attempts = Math.max(0, row.captchaAttempt) + (abandon ? 1 : 0);

  let circuit: PortalAutofillCapMonsterCbCheckpoint | null = null;
  if (
    row.capmonsterCbState === 'closed' ||
    row.capmonsterCbState === 'open' ||
    row.capmonsterCbState === 'half-open'
  ) {
    circuit = {
      state: row.capmonsterCbState,
      consecutiveFailures: row.capmonsterCbConsecutiveFailures,
      openedAt: row.capmonsterCbOpenedAt,
    };
  }

  return {
    attempts,
    budgetDeadlineAt: row.captchaBudgetDeadlineAt,
    circuit,
    countAbandonedInflightAttempt: abandon,
  };
};
