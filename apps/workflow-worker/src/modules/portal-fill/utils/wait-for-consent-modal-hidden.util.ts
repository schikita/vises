import { CONSENT_MODAL_POLL_INTERVAL_MS } from '../constants';
import type { ConsentModalStepId, PortalPage } from '../types';
import { buildConsentModalActionArg } from './build-consent-modal-action-arg.util';
import { consentModalActionInPage } from './consent-modal-action-in-page.util';
import { consentModalSleep } from './consent-modal-sleep.util';

export const waitForConsentModalHidden = async (
  page: PortalPage,
  stepId: ConsentModalStepId,
  budgetMs: number,
): Promise<boolean> => {
  const arg = buildConsentModalActionArg(stepId, 'inspect');
  if (budgetMs <= 0) {
    return !(await page.evaluate(consentModalActionInPage, arg)).shown;
  }
  const deadline = Date.now() + budgetMs;
  while (Date.now() < deadline) {
    if (!(await page.evaluate(consentModalActionInPage, arg)).shown) {
      return true;
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await consentModalSleep(Math.min(CONSENT_MODAL_POLL_INTERVAL_MS, remaining));
  }
  return !(await page.evaluate(consentModalActionInPage, arg)).shown;
};
