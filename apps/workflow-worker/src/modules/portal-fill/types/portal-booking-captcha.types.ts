import type { CaptchaProvider } from '../interfaces';
import type { PortalBookingCheckpointCallbacks } from './portal-booking-checkpoint.types';
import type { PortalPage } from './patchright-surface.types';

/** Options for post-Submit booking captcha probe + solve (REQ-013 / VT-TASK-008). */
export type RunPortalBookingCaptchaPhaseOptions = {
  page: PortalPage;
  captchaServiceApiKey?: string;
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
  onCheckpoint?: PortalBookingCheckpointCallbacks['onCheckpoint'];
  logPrefix?: string;
  abortSignal?: AbortSignal;
};

/**
 * Captcha phase outcome. Absent captcha is success (`captchaPresent: false`) —
 * do not fail solely for missing captcha (REQ-013).
 */
export type RunPortalBookingCaptchaPhaseResult = {
  ok: boolean;
  /** True when booking captcha roots + `#btnVerify` were visible. */
  captchaPresent: boolean;
  /**
   * True when solve/verify succeeded and booking captcha surface dismissed
   * (not `#btnVerified` — materials document `#btnVerify` only).
   */
  captchaOk?: boolean;
  error?: string;
  errorCode?: string;
  notes: string[];
};
