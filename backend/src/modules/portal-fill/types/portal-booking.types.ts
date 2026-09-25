import type { CaptchaProvider } from '../interfaces';
import type { PatchrightProxyConfig } from '../../proxy6/types/proxy6-lease.types';
import type { PortalFillAbortCooperation } from './portal-fill-abort.types';
import type { PortalPage } from './patchright-surface.types';

/** CRM hints for optional unambiguous booking prefill (REQ-030 / DEC-011). */
export type PortalBookingPrefillHint = {
  /** maps to Location dropdown text (`applications.submit_city`). */
  submitCity?: string;
  /** maps to Visa Type dropdown text (`applications.visa_type`). */
  visaType?: string;
  /** When exactly 1, Appointment For = Individual is unambiguous. */
  applicantCount?: number;
};

export type PortalBookingPrefillOutcome = {
  locationPrefillAttempted: boolean;
  locationPrefillApplied: boolean;
  visaTypePrefillAttempted: boolean;
  visaTypePrefillApplied: boolean;
  appointmentForPrefillAttempted: boolean;
  appointmentForPrefillApplied: boolean;
  /** True when CRM→portal map was ambiguous for any field (staff takeover). */
  ambiguous: boolean;
  notes: string[];
};

/** Options for booking safe-stop pipeline after login navigation. */
export type RunPortalBookingSafeStopPipelineOptions = {
  page: PortalPage;
  portalFormEmail: string;
  portalPassword: string;
  manageApplicantsUrl: string;
  prefill?: PortalBookingPrefillHint;
  captchaServiceApiKey?: string;
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
  logPrefix?: string;
  /** Forwarded into login-prep Verified-loop abort-aware waits (DEC-012). */
  abortSignal?: AbortSignal;
};

/** Pipeline outcome for BOOK task (CON-006). */
export type RunPortalBookingSafeStopPipelineResult = {
  ok: boolean;
  /** True when location/visa selection UI is reachable (safe stop). */
  bookingSelectionUiOpen?: boolean;
  prefill?: PortalBookingPrefillOutcome;
  /**
   * True if automation would have (or did) advance past VisaType submit /
   * payment / Premium Lounge Accept — MUST NOT click; classify NOT_SAFE.
   */
  notSafeToRepeat?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};

/** Browser launch + login + booking safe-stop fill façade options. */
export type FillPortalBookingSafeStopOptions = PortalFillAbortCooperation & {
  loginUrl: string;
  manageApplicantsUrl: string;
  portalFormEmail: string;
  portalPassword: string;
  prefill?: PortalBookingPrefillHint;
  headed: boolean;
  captchaServiceApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
};

export type FillPortalBookingSafeStopResult = {
  navigationOk: boolean;
  /** True when AbortSignal aborted the fill (immediate-stop). */
  aborted?: boolean;
  bookingSelectionUiOpen?: boolean;
  prefill?: PortalBookingPrefillOutcome;
  notSafeToRepeat?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};
