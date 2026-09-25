/**
 * Autofill checkpoint types re-exported for façade HTTP/resume.
 * Verified-loop snapshot lives in portal-fill (DEC-004).
 */
export type { PortalCaptchaVerifiedLoopCheckpointSnapshot } from '../../portal-fill';

export type {
  PortalAutofillCheckpointPatch,
  PortalAutofillCaptchaRestore,
  PortalAutofillPipelineCheckpointCallbacks,
} from '../../portal-core';
