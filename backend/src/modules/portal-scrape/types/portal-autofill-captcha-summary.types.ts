import type { PortalAutofillCapMonsterCbState } from '../../portal-core';

/**
 * Staff-safe captcha-service budget flags for run list enrichment (REQ-007 / DEC-008).
 * Never includes API keys, images, or raw captcha-service payloads.
 */
export type PortalAutofillCaptchaSummary = {
  /** Persisted CB state; null when never armed / legacy row. */
  cbState: PortalAutofillCapMonsterCbState | null;
  permanentFailed: boolean;
  /** True when `captcha_budget_deadline_at` is set and has elapsed. */
  budgetExhausted: boolean;
};
