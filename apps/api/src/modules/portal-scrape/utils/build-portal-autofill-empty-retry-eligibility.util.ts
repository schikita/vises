import {
  PORTAL_AUTOFILL_RETRY_MSG_NO_APPLICANT,
} from '../constants';
import type { PortalAutofillRetryEligibility } from '../types';

/** Empty eligibility when no applicant pair can be resolved for the list. */
export const buildPortalAutofillEmptyRetryEligibility =
  (): PortalAutofillRetryEligibility => ({
    canResume: false,
    canStartOrSupersede: false,
    captchaRetryViaNewRun: false,
    blockedReasonRu: PORTAL_AUTOFILL_RETRY_MSG_NO_APPLICANT,
    impliedMode: 'none',
  });
