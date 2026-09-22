import type { ICaptchaSolver } from '../../capmonster';
import type { PatchrightProxyConfig } from '../../proxy6';
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
  capMonsterApiKey?: string;
  capMonster?: Pick<ICaptchaSolver, 'solveBls3x3'>;
  logPrefix?: string;
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
  notes: string[];
};

/** Browser launch + login + booking safe-stop fill façade options. */
export type FillPortalBookingSafeStopOptions = {
  loginUrl: string;
  manageApplicantsUrl: string;
  portalFormEmail: string;
  portalPassword: string;
  prefill?: PortalBookingPrefillHint;
  headed: boolean;
  capMonsterApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
};

export type FillPortalBookingSafeStopResult = {
  navigationOk: boolean;
  bookingSelectionUiOpen?: boolean;
  prefill?: PortalBookingPrefillOutcome;
  notSafeToRepeat?: boolean;
  error?: string;
  notes: string[];
};
