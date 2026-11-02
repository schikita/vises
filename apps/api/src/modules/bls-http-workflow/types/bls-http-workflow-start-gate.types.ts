/**
 * Result of pure Completeness + date start-gate evaluation (DEC-001).
 * Side effects (needs-fixes, HTTP throw) stay in Nest `enforceStartGateOrThrow`.
 */
export type BlsHttpWorkflowStartGateResult =
  | { ok: true }
  | { ok: false; detail: string };

export type EvaluateBlsHttpWorkflowStartGateInput = {
  applicants: unknown;
  clientEmail: string;
  returnDate: string;
  /** Optional override for tests; defaults to UTC `D` inside date collector. */
  referenceDateYmd?: string;
};
