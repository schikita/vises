import { CONSENT_MODAL_STEP_BUDGET_CAP_MS } from '../constants';

/**
 * Per-step budget derived from nav timeout (DEC-004).
 * Always finite and ≤ navTimeoutMs (when navTimeoutMs ≥ 0).
 */
export const consentModalStepBudgetMs = (navTimeoutMs: number): number => {
  const nav = Number.isFinite(navTimeoutMs) ? Math.max(0, navTimeoutMs) : 0;
  return Math.min(CONSENT_MODAL_STEP_BUDGET_CAP_MS, nav);
};
