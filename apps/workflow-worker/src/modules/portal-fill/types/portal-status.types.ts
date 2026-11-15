import type { CaptchaProvider } from '../interfaces';
import type { PatchrightProxyConfig } from '../../proxy6/types/proxy6-lease.types';
import type { BlsApplicantPortalStatus } from './bls-applicant-portal-status.types';
import type { EditMemberFillInput } from './edit-member-fill-input.types';
import type { PortalFillAbortCooperation } from './portal-fill-abort.types';
import type { PortalPage } from './patchright-surface.types';
import type {
  PortalStatusCheckpoint,
  PortalStatusCheckpointCallbacks,
} from './portal-status-checkpoint.types';

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
  /** Absolute authenticated Global home URL (successful-enter gate). */
  homeUrl: string;
  manageApplicantsUrl: string;
  applicant: PortalStatusApplicantMatchHint;
  /**
   * CRM → Edit Member fill plan (MA-TASK-004/005). Values stay in memory only.
   */
  editFill?: EditMemberFillInput;
  captchaServiceApiKey?: string;
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
  logPrefix?: string;
  /** Forwarded into login-prep Verified-loop abort-aware waits (DEC-012). */
  abortSignal?: AbortSignal;
  /** Prior durable checkpoint for resume (REQ-017); null = scrape-first. */
  priorCheckpoint?: PortalStatusCheckpoint | null;
  /** Persist step / portalStatus / fieldProgress without values (REQ-015). */
  onCheckpoint?: PortalStatusCheckpointCallbacks['onCheckpoint'];
  /**
   * CRM applicant ids present before workflow start (OQ-005).
   * Used to resolve `shouldAddFamilyMembers` and application primary.
   */
  crmApplicantIds?: ReadonlyArray<string>;
  /**
   * Pre-resolved Add Family Member gate from status client.
   * When omitted, pipeline resolves from `crmApplicantIds` + primary.
   */
  shouldAddFamilyMembers?: boolean;
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
  /** Absolute authenticated Global home URL (successful-enter gate). */
  homeUrl: string;
  manageApplicantsUrl: string;
  portalFormEmail: string;
  portalPassword: string;
  applicant: PortalStatusApplicantMatchHint;
  editFill?: RunPortalStatusValidatePipelineOptions['editFill'];
  headed: boolean;
  captchaServiceApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
  /** Prior durable checkpoint for resume (REQ-017); null = scrape-first. */
  priorCheckpoint?: PortalStatusCheckpoint | null;
  /** Persist step / portalStatus / fieldProgress without values (REQ-015). */
  onCheckpoint?: PortalStatusCheckpointCallbacks['onCheckpoint'];
  /**
   * CRM applicant ids present before workflow start (OQ-005 / MA-TASK-008).
   */
  crmApplicantIds?: ReadonlyArray<string>;
  /**
   * Pre-resolved Add Family Member gate (OQ-005).
   * Pipeline must not click Add unless this is true AND Phase B enabled.
   */
  shouldAddFamilyMembers?: boolean;
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
