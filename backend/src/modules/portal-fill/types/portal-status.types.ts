import type { CaptchaProvider } from '../interfaces';
import type { PatchrightProxyConfig } from '../../proxy6/types/proxy6-lease.types';
import type { BlsApplicantPortalStatus } from './bls-applicant-portal-status.types';
import type { PortalFillAbortCooperation } from './portal-fill-abort.types';
import type { PortalPage } from './patchright-surface.types';

/** One scraped Manage Applicants row (fixture-aligned). */
export type PortalApplicantStatusRow = {
  rowIndex: number;
  nameText: string;
  statusRaw: string;
  status: BlsApplicantPortalStatus;
  /** First arg of ManageApplicant('…') when present. */
  portalApplicantId: string | null;
  hasEditAction: boolean;
};

/** Match hints from CRM applicant jsonb. */
export type PortalStatusApplicantMatchHint = {
  applicantId: string;
  firstName?: string;
  lastName?: string;
  /** 0-based index among application applicants (ordinal fallback). */
  ordinalIndex: number;
};

/** Options for status-validate pipeline after login navigation. */
export type RunPortalStatusValidatePipelineOptions = {
  page: PortalPage;
  portalFormEmail: string;
  portalPassword: string;
  manageApplicantsUrl: string;
  applicant: PortalStatusApplicantMatchHint;
  /** Optional plain field values for edit path when form fields are empty. */
  editFill?: {
    firstName?: string;
    lastName?: string;
    placeOfBirth?: string;
    passportNumber?: string;
  };
  captchaServiceApiKey?: string;
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
  logPrefix?: string;
  /** Forwarded into login-prep Verified-loop abort-aware waits (DEC-012). */
  abortSignal?: AbortSignal;
};

/** Pipeline outcome for one STATUS_APPLICANT task. */
export type RunPortalStatusValidatePipelineResult = {
  ok: boolean;
  /** True only when matched applicant normalized to READY_TO_BOOK. */
  readyToBook?: boolean;
  status?: BlsApplicantPortalStatus;
  statusRaw?: string;
  editAttempted?: boolean;
  attentionAccepted?: boolean;
  /**
   * Edit submit may have applied without confirmed READY_TO_BOOK
   * (VERIFY_THEN_REPEAT).
   */
  submitAmbiguous?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};

/** Browser launch + login + status validate fill façade options. */
export type FillPortalStatusValidateOptions = PortalFillAbortCooperation & {
  loginUrl: string;
  manageApplicantsUrl: string;
  portalFormEmail: string;
  portalPassword: string;
  applicant: PortalStatusApplicantMatchHint;
  editFill?: RunPortalStatusValidatePipelineOptions['editFill'];
  headed: boolean;
  captchaServiceApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
};

export type FillPortalStatusValidateResult = {
  navigationOk: boolean;
  /** True when AbortSignal aborted the fill (immediate-stop). */
  aborted?: boolean;
  readyToBook?: boolean;
  status?: BlsApplicantPortalStatus;
  statusRaw?: string;
  editAttempted?: boolean;
  attentionAccepted?: boolean;
  submitAmbiguous?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};
