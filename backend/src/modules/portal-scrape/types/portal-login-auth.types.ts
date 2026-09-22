/** Result of authenticated-landing probe after password submit (REQ-011). */
export type PortalLoginAuthVerifyResult = {
  ok: boolean;
  /** Which heuristic confirmed departure from the login UI. */
  via?: string;
  reason?: string;
};
