import type { ICaptchaSolver } from '../../capmonster';
import type { PatchrightProxyConfig } from '../../proxy6';
import type { PortalPage } from './patchright-surface.types';

/** Options for the login-page pipeline after navigation (DEC-006–008 / DEC-012 / REQ-011). */
export type RunPortalLoginPrepPipelineOptions = {
  page: PortalPage;
  /** Application portal-form email only — never CRM clientEmail (REQ-011). */
  portalFormEmail: string;
  screenshotPath?: string;
  /** Non-empty CapMonster key ⇒ click #btnVerify + verified loop (DEC-012). */
  capMonsterApiKey?: string;
  capMonster?: Pick<ICaptchaSolver, 'solveBls3x3'>;
  logPrefix?: string;
  /**
   * Workflow LOGIN path (REQ-011 / TASK-009). When true, continue past
   * email+#btnVerify stop: fill vaulted password, submit, verify authed.
   * Staff POST …/portal-login-prep leaves this unset/false.
   */
  submitPassword?: boolean;
  /**
   * Plaintext portal password for in-memory submit only when `submitPassword`.
   * Never logged or returned by the pipeline.
   */
  portalPassword?: string;
};

export type RunPortalLoginPrepPipelineResult = {
  ok: boolean;
  error?: string;
  emailFilled: boolean;
  verifyClicked: boolean;
  capMonsterAttempted: boolean;
  capMonsterOk: boolean;
  /** True when password was filled on the workflow path. */
  passwordFilled?: boolean;
  /** True when password-step `#btnVerify` / Submit was clicked. */
  passwordSubmitted?: boolean;
  /**
   * Password submit may have applied without confirmed authed landing
   * (VERIFY_THEN_REPEAT).
   */
  passwordSubmitAmbiguous?: boolean;
  /** True when login form cues cleared after password path. */
  loginAuthenticatedVerified?: boolean;
  screenshotPath?: string;
  notes: string[];
};

/** Browser launch + navigate + pipeline options for login prep fill façade. */
export type FillPortalLoginPrepOptions = {
  targetUrl: string;
  portalFormEmail: string;
  headed: boolean;
  screenshotPath?: string;
  capMonsterApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
  /** Opt-in workflow LOGIN password submit (default false — staff prep stop). */
  submitPassword?: boolean;
  /** In-memory vault plaintext; never logged. */
  portalPassword?: string;
};

export type FillPortalLoginPrepResult = {
  navigationOk: boolean;
  error?: string;
  emailFilled: boolean;
  verifyClicked: boolean;
  capMonsterAttempted: boolean;
  capMonsterOk: boolean;
  passwordFilled?: boolean;
  passwordSubmitted?: boolean;
  passwordSubmitAmbiguous?: boolean;
  loginAuthenticatedVerified?: boolean;
  screenshotPath?: string;
  notes: string[];
};

/** Sync HTTP outcome for portal login prep (DEC-002). */
export type PortalLoginPrepReport = {
  ok: boolean;
  applicationId: string;
  loginUrl?: string;
  emailFilled: boolean;
  verifyClicked: boolean;
  capMonsterAttempted: boolean;
  capMonsterOk: boolean;
  /** Optional evidence path under UPLOAD_DIR; no status scrape claims (DEC-007). */
  screenshotRelativePath?: string | null;
  notes: string[];
  error?: string;
};

export type PortalLoginPrepHttpOutcome = {
  httpStatus: 200 | 422 | 502;
  report: PortalLoginPrepReport;
};
