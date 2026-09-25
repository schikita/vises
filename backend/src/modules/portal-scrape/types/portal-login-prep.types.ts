/** Sync HTTP outcome for portal login prep (DEC-002). Façade-owned. */
export type PortalLoginPrepReport = {
  ok: boolean;
  applicationId: string;
  loginUrl?: string;
  emailFilled: boolean;
  verifyClicked: boolean;
  captchaAttempted: boolean;
  captchaOk: boolean;
  /** Optional evidence path under UPLOAD_DIR; no status scrape claims (DEC-007). */
  screenshotRelativePath?: string | null;
  notes: string[];
  error?: string;
};

export type PortalLoginPrepHttpOutcome = {
  httpStatus: 200 | 422 | 502;
  report: PortalLoginPrepReport;
};

export type {
  FillPortalLoginPrepOptions,
  FillPortalLoginPrepResult,
  RunPortalLoginPrepPipelineOptions,
  RunPortalLoginPrepPipelineResult,
} from '../../portal-fill';
