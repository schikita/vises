import type { PortalAutofillRun } from '../../database/entities/portal-autofill-run.entity';
import type { PortalAutofillCaptchaSummary } from '../types';
import { resolvePortalAutofillCapMonsterCbState } from './resolve-portal-autofill-capmonster-cb-state.util';

/** Build staff-safe captcha/CB summary flags from a run row (REQ-007). */
export const buildPortalAutofillCaptchaSummary = (
  run: PortalAutofillRun,
  nowMs: number,
): PortalAutofillCaptchaSummary => {
  const deadline = run.captchaBudgetDeadlineAt;
  const budgetExhausted =
    deadline != null && nowMs >= deadline.getTime();

  return {
    cbState: resolvePortalAutofillCapMonsterCbState(run.capmonsterCbState),
    permanentFailed: run.capmonsterPermanentFailed === true,
    budgetExhausted,
  };
};
