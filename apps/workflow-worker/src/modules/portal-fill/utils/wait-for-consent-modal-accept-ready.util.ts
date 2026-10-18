import { CONSENT_MODAL_POLL_INTERVAL_MS } from '../constants';
import type {
  ConsentModalActionResult,
  ConsentModalStepId,
  PortalPage,
} from '../types';
import { buildConsentModalActionArg } from './build-consent-modal-action-arg.util';
import { consentModalActionInPage } from './consent-modal-action-in-page.util';
import { consentModalSleep } from './consent-modal-sleep.util';

/**
 * Wait until the accept control is visible/enabled inside an already-shown modal.
 */
export const waitForConsentModalAcceptReady = async (
  page: PortalPage,
  stepId: ConsentModalStepId,
  budgetMs: number,
): Promise<ConsentModalActionResult> => {
  const arg = buildConsentModalActionArg(stepId, 'inspect');
  if (budgetMs <= 0) {
    return page.evaluate(consentModalActionInPage, arg);
  }
  const deadline = Date.now() + budgetMs;
  let last = await page.evaluate(consentModalActionInPage, arg);
  while (Date.now() < deadline) {
    if (!last.shown) return last;
    if (last.acceptReady) return last;
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await consentModalSleep(Math.min(CONSENT_MODAL_POLL_INTERVAL_MS, remaining));
    last = await page.evaluate(consentModalActionInPage, arg);
  }
  return last;
};
