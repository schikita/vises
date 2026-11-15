import type { CaptchaProvider } from '../interfaces';
import type { TemporaryEmailProvider } from '../../temporary-email';
import type { PatchrightProxyConfig } from '../../proxy6/types/proxy6-lease.types';
import type {
  PortalBookingCheckpoint,
  PortalBookingCheckpointCallbacks,
  PortalBookingFieldProgress,
} from './portal-booking-checkpoint.types';
import type { PortalBookingEmailConsentMailbox } from './portal-booking-email-consent.types';
import type { PortalFillAbortCooperation } from './portal-fill-abort.types';
import type { PortalPage } from './patchright-surface.types';

/** CRM hints for optional unambiguous booking prefill (REQ-010 / REQ-020 / DEC-006). */
export type PortalBookingPrefillHint = {
  /** maps to Location dropdown text (`applications.submit_city`). */
  submitCity?: string;
  /** maps to Visa Type dropdown text (`applications.visa_type`). */
  visaType?: string;
  /** maps to Visa Sub Type dropdown text when CRM provides it. */
  visaSubType?: string;
  /**
   * Category preference. Empty → Prefer Normal (DEC-006).
   * Premium → staff stop (do not Accept Premium modal).
   */
  category?: string;
  /** When exactly 1 → Individual; 2–10 → Family + Number Of Members. */
  applicantCount?: number;
};

export type PortalBookingPrefillOutcome = {
  locationPrefillAttempted: boolean;
  locationPrefillApplied: boolean;
  visaTypePrefillAttempted: boolean;
  visaTypePrefillApplied: boolean;
  visaSubTypePrefillAttempted: boolean;
  visaSubTypePrefillApplied: boolean;
  appointmentForPrefillAttempted: boolean;
  appointmentForPrefillApplied: boolean;
  numberOfMembersPrefillAttempted: boolean;
  numberOfMembersPrefillApplied: boolean;
  categoryPrefillAttempted: boolean;
  categoryPrefillApplied: boolean;
  /** True when Family path accepted `#familyDisclaimer` (DEC-007). */
  familyDisclaimerAccepted: boolean;
  /**
   * True when CRM requires Premium — staff gate; never Accept Premium modal
   * (DEC-006 / CON-004).
   */
  premiumRequiredStaffStop: boolean;
  /** True when CRM→portal map was ambiguous for any field (staff takeover). */
  ambiguous: boolean;
  /** Field ids → status only (never values) for checkpoint merge. */
  fieldProgress: PortalBookingFieldProgress;
  notes: string[];
};

/** Options for booking continue pipeline after login navigation. */
export type RunPortalBookingContinuePipelineOptions = {
  page: PortalPage;
  portalFormEmail: string;
  portalPassword: string;
  /** Absolute authenticated Global home URL (successful-enter gate). */
  homeUrl: string;
  manageApplicantsUrl: string;
  prefill?: PortalBookingPrefillHint;
  captchaServiceApiKey?: string;
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
  /**
   * Retained mailbox + TemporaryEmailProvider for DP consent before Book
   * (REQ-002…006 / DEC-002). Required unless prior checkpoint already consented.
   */
  mailProvider?: Pick<
    TemporaryEmailProvider,
    | 'createAccount'
    | 'waitLatestMessage'
    | 'extractDataProtectionConsentHref'
    | 'disposeSession'
  >;
  mailbox?: PortalBookingEmailConsentMailbox;
  priorCheckpoint?: PortalBookingCheckpoint | null;
  onCheckpoint?: PortalBookingCheckpointCallbacks['onCheckpoint'];
  logPrefix?: string;
  /** Forwarded into login-prep Verified-loop abort-aware waits (DEC-012). */
  abortSignal?: AbortSignal;
};

/**
 * Pipeline outcome for BOOK continue (DEC-001 / CON-005 / DEC-004 / OQ-007).
 * Submit is in scope; Premium/payment remain hard-stop.
 * Materials-covered unknown-next → staff terminal (not open-UI-only success).
 */
export type RunPortalBookingContinuePipelineResult = {
  ok: boolean;
  /** True when location/visa selection UI is reachable. */
  bookingSelectionUiOpen?: boolean;
  /** True when VisaType `#btnSubmit` click / navigation start succeeded. */
  visaTypeSubmitted?: boolean;
  /** True when booking captcha roots + `#btnVerify` were probed present. */
  captchaPresent?: boolean;
  /**
   * True when booking captcha solve succeeded and surface dismissed
   * (not `#btnVerified`).
   */
  captchaOk?: boolean;
  /** True when slots-unavailable banner was detected (REQ-014 / VT-TASK-009). */
  slotsUnavailable?: boolean;
  /**
   * True when post-submit/captcha page is outside materials (slots absent) —
   * staff terminal `AWAITING_STAFF_BOOKING` (DEC-004 / OQ-007 / REQ-017).
   */
  unknownNext?: boolean;
  prefill?: PortalBookingPrefillOutcome;
  /**
   * True when Premium Lounge / payment surface was detected or CRM requires
   * Premium — MUST NOT Accept/confirm; classify NOT_SAFE.
   */
  notSafeToRepeat?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};

/** Browser launch + login + booking continue fill façade options. */
export type FillPortalBookingContinueOptions = PortalFillAbortCooperation & {
  loginUrl: string;
  /** Absolute authenticated Global home URL (successful-enter gate). */
  homeUrl: string;
  manageApplicantsUrl: string;
  portalFormEmail: string;
  portalPassword: string;
  prefill?: PortalBookingPrefillHint;
  headed: boolean;
  captchaServiceApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
  mailbox?: PortalBookingEmailConsentMailbox;
  priorCheckpoint?: PortalBookingCheckpoint | null;
  onCheckpoint?: PortalBookingCheckpointCallbacks['onCheckpoint'];
};

export type FillPortalBookingContinueResult = {
  navigationOk: boolean;
  /** True when AbortSignal aborted the fill (immediate-stop). */
  aborted?: boolean;
  bookingSelectionUiOpen?: boolean;
  visaTypeSubmitted?: boolean;
  captchaPresent?: boolean;
  captchaOk?: boolean;
  /** True when slots-unavailable banner was detected (REQ-014 / VT-TASK-009). */
  slotsUnavailable?: boolean;
  /**
   * True when post-submit/captcha page is outside materials —
   * BOOK advance → `AWAITING_STAFF_BOOKING` (DEC-004 / OQ-007).
   */
  unknownNext?: boolean;
  prefill?: PortalBookingPrefillOutcome;
  notSafeToRepeat?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};
