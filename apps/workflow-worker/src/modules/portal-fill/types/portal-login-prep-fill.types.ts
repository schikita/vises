import type { PatchrightProxyConfig } from '../../proxy6/types/proxy6-lease.types';
import type { CaptchaProvider } from '../interfaces';
import type { PortalFillAbortCooperation } from './portal-fill-abort.types';
import type { PortalPage } from './patchright-surface.types';

/** Options for the login-page pipeline after navigation (DEC-006–008 / DEC-012 / REQ-011). */
export type RunPortalLoginPrepPipelineOptions = {
  page: PortalPage;
  /** Application portal-form email only — never CRM clientEmail (REQ-011). */
  portalFormEmail: string;
  screenshotPath?: string;
  /** Non-empty captcha service key ⇒ click #btnVerify + verified loop (DEC-012). */
  captchaServiceApiKey?: string;
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
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
  /**
   * Optional fill/workflow abort signal forwarded into Verified-loop
   * progressive unsolvable backoff (DEC-012).
   */
  abortSignal?: AbortSignal;
};

export type RunPortalLoginPrepPipelineResult = {
  ok: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  emailFilled: boolean;
  verifyClicked: boolean;
  captchaAttempted: boolean;
  captchaOk: boolean;
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
export type FillPortalLoginPrepOptions = PortalFillAbortCooperation & {
  targetUrl: string;
  portalFormEmail: string;
  headed: boolean;
  screenshotPath?: string;
  captchaServiceApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
  /** Opt-in workflow LOGIN password submit (default false — staff prep stop). */
  submitPassword?: boolean;
  /** In-memory vault plaintext; never logged. */
  portalPassword?: string;
};

export type FillPortalLoginPrepResult = {
  navigationOk: boolean;
  /** True when AbortSignal aborted the fill (immediate-stop). */
  aborted?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  emailFilled: boolean;
  verifyClicked: boolean;
  captchaAttempted: boolean;
  captchaOk: boolean;
  passwordFilled?: boolean;
  passwordSubmitted?: boolean;
  passwordSubmitAmbiguous?: boolean;
  loginAuthenticatedVerified?: boolean;
  screenshotPath?: string;
  notes: string[];
};
