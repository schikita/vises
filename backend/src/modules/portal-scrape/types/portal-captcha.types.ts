/**
 * Portal BLS CAPTCHA extract / apply / solve types (REQ-003 / REQ-005).
 */

export type BlsChallengeExtract = {
  /** Exactly nine raw base64 images (no data-URI prefix). */
  imagesBase64: string[];
  /** CapMonster metadata.TaskArgument (target number string). */
  taskArgument: string;
};

export type ApplyBlsAnswerResult = {
  clickedIndices: number[];
  confirmClicked: boolean;
};

export type SolvePortalBlsCaptchaInput = {
  clientKey: string;
  timeoutMs: number;
  pollIntervalMs: number;
  /** UI wait after Verify for challenge root (prefer CapMonster timeout). */
  waitTimeoutMs?: number;
};

export type SolvePortalBlsCaptchaResult = {
  answer: boolean[];
  taskId: number;
  clickedIndices: number[];
  confirmClicked: boolean;
};

/** Arg for in-page BLS challenge extraction evaluate. */
export type ExtractBlsChallengeInPageArg = {
  cellImages: string;
  taskArgument: string;
  cellCount: number;
  decoyLabelColorRgb: string;
  rowTolerancePx: number;
  taskArgumentPatternSource: string;
  taskArgumentPatternFlags: string;
};

/** Result from in-page BLS challenge extraction evaluate. */
export type ExtractBlsChallengeInPageResult = {
  ok: boolean;
  error?: string;
  imagesBase64?: string[];
  taskArgument?: string;
};

/** Arg for in-page BLS answer apply evaluate. */
export type ApplyBlsAnswerInPageArg = {
  cellClickTargets: string;
  confirmControl: string;
  answer: boolean[];
  cellCount: number;
  rowTolerancePx: number;
};

/** Result from in-page BLS answer apply evaluate. */
export type ApplyBlsAnswerInPageResult = {
  ok: boolean;
  error?: string;
  clickedIndices?: number[];
  confirmClicked?: boolean;
};
