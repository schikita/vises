import type { CaptchaProvider } from '../interfaces';
import type { PatchrightProxyConfig } from '../../proxy6/types/proxy6-lease.types';
import type { PortalFillAbortCooperation } from './portal-fill-abort.types';
import type { PortalPage } from './patchright-surface.types';

/** Options for password-change pipeline after navigation (REQ-012). */
export type RunPortalPasswordChangePipelineOptions = {
  page: PortalPage;
  /** Application portal-form email — never CRM clientEmail. */
  portalFormEmail: string;
  /** Current vaulted password (in-memory only; never logged). */
  currentPassword: string;
  /** Newly generated compliant password (in-memory only; never logged). */
  newPassword: string;
  /** Absolute authenticated Global home URL (successful-enter gate). */
  homeUrl: string;
  captchaServiceApiKey?: string;
  captchaProvider?: Pick<CaptchaProvider, 'solveBls3x3'>;
  logPrefix?: string;
  /** Forwarded into login-prep Verified-loop abort-aware waits (DEC-012). */
  abortSignal?: AbortSignal;
};

/** Pipeline outcome: change applied, UI not presented, or failure. */
export type RunPortalPasswordChangePipelineResult = {
  ok: boolean;
  /** True when forced-change UI was absent after authenticated landing. */
  notPresented?: boolean;
  /** True when change form was submitted and form cues cleared. */
  passwordChanged?: boolean;
  /**
   * Submit may have applied without confirmed form absence
   * (VERIFY_THEN_REPEAT).
   */
  submitAmbiguous?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};

/** Browser launch + login + conditional change fill façade options. */
export type FillPortalPasswordChangeOptions = PortalFillAbortCooperation & {
  targetUrl: string;
  /** Absolute authenticated Global home URL (successful-enter gate). */
  homeUrl: string;
  portalFormEmail: string;
  currentPassword: string;
  newPassword: string;
  headed: boolean;
  captchaServiceApiKey?: string;
  browserProxy?: PatchrightProxyConfig;
  applicationId?: string;
};

export type FillPortalPasswordChangeResult = {
  navigationOk: boolean;
  /** True when AbortSignal aborted the fill (immediate-stop). */
  aborted?: boolean;
  notPresented?: boolean;
  passwordChanged?: boolean;
  submitAmbiguous?: boolean;
  error?: string;
  /** Structured failure code when known (e.g. CapMonster unsolvable exhaustion). */
  errorCode?: string;
  notes: string[];
};

/** Result of forced password-change form presence probe. */
export type PortalPasswordChangeFormVisibleResult = {
  visible: boolean;
  via?: string;
};

/** Result of post-submit verify (form cues gone). */
export type PortalPasswordChangeVerifyResult =
  | { ok: true; via: string }
  | { ok: false; reason: string };
