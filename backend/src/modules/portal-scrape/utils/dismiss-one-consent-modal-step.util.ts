import { CONSENT_MODAL_SHOWN_SETTLE_MS } from '../constants';
import type {
  ConsentModalStepId,
  ConsentModalStepResult,
  PortalPage,
} from '../types';
import { buildConsentModalActionArg } from './build-consent-modal-action-arg.util';
import { consentModalActionInPage } from './consent-modal-action-in-page.util';
import { consentModalPresenceWindowMs } from './consent-modal-presence-window-ms.util';
import { consentModalSleep } from './consent-modal-sleep.util';
import { consentModalStepBudgetMs } from './consent-modal-step-budget-ms.util';
import { waitForConsentModalAcceptReady } from './wait-for-consent-modal-accept-ready.util';
import { waitForConsentModalHidden } from './wait-for-consent-modal-hidden.util';
import { waitForConsentModalShown } from './wait-for-consent-modal-shown.util';

export const dismissOneConsentModalStep = async (
  page: PortalPage,
  stepId: ConsentModalStepId,
  navTimeoutMs: number,
): Promise<ConsentModalStepResult> => {
  const stepBudget = consentModalStepBudgetMs(navTimeoutMs);
  const presenceMs = consentModalPresenceWindowMs(stepBudget);
  const stepStarted = Date.now();

  const shown = await waitForConsentModalShown(page, stepId, presenceMs);
  if (!shown) {
    return { stepId, outcome: 'skipped' };
  }

  const remainingAfterPresence = Math.max(
    0,
    stepBudget - (Date.now() - stepStarted),
  );
  if (remainingAfterPresence <= 0) {
    return {
      stepId,
      outcome: 'failed',
      error: `consent modal ${stepId}: shown but accept timed out (budget exhausted)`,
    };
  }

  await consentModalSleep(
    Math.min(CONSENT_MODAL_SHOWN_SETTLE_MS, remainingAfterPresence),
  );

  const readyBudget = Math.max(0, stepBudget - (Date.now() - stepStarted));
  const ready = await waitForConsentModalAcceptReady(page, stepId, readyBudget);
  if (!ready.shown) {
    return { stepId, outcome: 'skipped' };
  }
  if (!ready.acceptReady) {
    return {
      stepId,
      outcome: 'failed',
      error:
        ready.error ??
        `consent modal ${stepId}: shown but accept control not found`,
    };
  }

  const clickBudget = Math.max(0, stepBudget - (Date.now() - stepStarted));
  if (clickBudget <= 0) {
    return {
      stepId,
      outcome: 'failed',
      error: `consent modal ${stepId}: shown but accept timed out (budget exhausted)`,
    };
  }

  const clickResult = await page.evaluate(
    consentModalActionInPage,
    buildConsentModalActionArg(stepId, 'click'),
  );
  if (!clickResult.shown) {
    return { stepId, outcome: 'skipped' };
  }
  if (!clickResult.clicked) {
    return {
      stepId,
      outcome: 'failed',
      error:
        clickResult.error ??
        `consent modal ${stepId}: accept control could not be activated`,
    };
  }

  const hideBudget = Math.max(0, stepBudget - (Date.now() - stepStarted));
  const hidden = await waitForConsentModalHidden(page, stepId, hideBudget);
  if (!hidden) {
    return {
      stepId,
      outcome: 'failed',
      error: `consent modal ${stepId}: still shown after accept within budget`,
    };
  }

  return { stepId, outcome: 'accepted' };
};
