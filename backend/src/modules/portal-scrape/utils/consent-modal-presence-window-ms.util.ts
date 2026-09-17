import {
  CONSENT_MODAL_PRESENCE_WINDOW_CAP_MS,
  CONSENT_MODAL_SHOWN_SETTLE_MS,
} from '../constants';

/**
 * Presence window within a step budget (DEC-004).
 * Absence after this window ⇒ skip (REQ-006).
 * Leaves a floor of the step budget for settle + click + hide wait.
 */
export const consentModalPresenceWindowMs = (stepBudgetMs: number): number => {
  const step = Number.isFinite(stepBudgetMs) ? Math.max(0, stepBudgetMs) : 0;
  const clickHideFloorMs = Math.min(
    3_000,
    Math.max(0, step - CONSENT_MODAL_SHOWN_SETTLE_MS),
  );
  const maxPresence = Math.max(0, step - clickHideFloorMs);
  return Math.min(CONSENT_MODAL_PRESENCE_WINDOW_CAP_MS, maxPresence);
};
