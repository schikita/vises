/**
 * Dismiss the three consent/attention modals in fixed order before field fill.
 * Missing/not-shown ⇒ skip; shown but unacceptible ⇒ hard-fail (DEC-003).
 */
import { CONSENT_MODAL_INTER_STEP_DELAY_MS, CONSENT_MODAL_STEP_IDS } from '../constants';
import type {
  ConsentModalStepResult,
  DismissConsentModalsResult,
  PortalPage,
} from '../types';
import { consentModalSleep } from './consent-modal-sleep.util';
import { dismissOneConsentModalStep } from './dismiss-one-consent-modal-step.util';

export const dismissConsentModalsInOrder = async (
  page: PortalPage,
  navTimeoutMs: number,
): Promise<DismissConsentModalsResult> => {
  const steps: ConsentModalStepResult[] = [];

  for (let i = 0; i < CONSENT_MODAL_STEP_IDS.length; i += 1) {
    const stepId = CONSENT_MODAL_STEP_IDS[i];
    const result = await dismissOneConsentModalStep(page, stepId, navTimeoutMs);
    steps.push(result);
    if (result.outcome === 'failed') {
      return {
        ok: false,
        steps,
        error: result.error ?? `consent modal ${stepId}: failed`,
      };
    }

    // Portal opens the next modal after a delay; wait before polling for it.
    const hasNext = i < CONSENT_MODAL_STEP_IDS.length - 1;
    if (hasNext && result.outcome === 'accepted') {
      await consentModalSleep(CONSENT_MODAL_INTER_STEP_DELAY_MS);
    }
  }

  return { ok: true, steps };
};
