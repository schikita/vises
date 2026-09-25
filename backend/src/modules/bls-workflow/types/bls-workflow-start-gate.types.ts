/**
 * Result of pure Completeness + date start-gate evaluation (DEC-001).
 * Side effects (needs-fixes, HTTP throw) stay in Nest `enforceStartGateOrThrow`.
 */
export type BlsWorkflowStartGateResult =
  | { ok: true }
  | { ok: false; detail: string };

export type EvaluateBlsWorkflowStartGateInput = {
  applicants: unknown;
  clientEmail: string;
  returnDate: string;
  /** Optional override for tests; defaults to UTC `D` inside date collector. */
  referenceDateYmd?: string;
};
