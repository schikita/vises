/** Outcome of external RegisterUser success-page verify (REQ-007 / DEC-019). */
export type PortalRegisterSuccessVerifyResult =
  | { ok: true; via: string }
  | { ok: false; reason: string };
