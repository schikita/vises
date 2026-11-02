/**
 * Staff HTTP DTOs for durable BLS workflow snapshot, events poll, and control (TASK-013/014).
 * Never include vault secrets, lockOwner, temporary email tokens, or DEK material.
 */

/** Step row in GET bls-workflow snapshot. */
export type BlsHttpWorkflowStepOut = {
  stepKey: string;
  ordinal: number;
  status: string;
  skipReason: string | null;
};

/** Task row in GET bls-workflow snapshot (DEC-003: id + maxAttempts additive). */
export type BlsHttpWorkflowTaskOut = {
  id: string;
  stepKey: string;
  taskKey: string;
  applicantId: string | null;
  ordinal: number;
  status: string;
  attemptCount: number;
  maxAttempts: number;
  lastErrorClass: string | null;
  lastErrorMessage: string | null;
};

/** GET /api/apps/:applicationId/bls-workflow (and by id) — no secrets (REQ-024). */
export type BlsHttpWorkflowOut = {
  workflowId: string;
  applicationId: string;
  status: string;
  currentStepKey: string | null;
  currentTaskKey: string | null;
  nextRunAt: string | null;
  lockHeld: boolean;
  terminalReason: string | null;
  steps: BlsHttpWorkflowStepOut[];
  tasks: BlsHttpWorkflowTaskOut[];
  updatedAt: string;
};

/** Single append-only event in poll response (REQ-029 / DEC-020). */
export type BlsHttpWorkflowEventOut = {
  id: number;
  eventType: string;
  stepKey: string | null;
  taskKey: string | null;
  payloadSafe: Record<string, unknown>;
  createdAt: string;
};

/** GET …/bls-workflow/:workflowId/events?sinceEventId=&limit= */
export type BlsHttpWorkflowEventsOut = {
  workflowId: string;
  workflowStatus: string;
  events: BlsHttpWorkflowEventOut[];
  latestEventId: number | null;
};

/** Input for append-only event persistence (runner / state transitions). */
export type AppendBlsHttpWorkflowEventInput = {
  workflowId: string;
  eventType: string;
  stepKey?: string | null;
  taskKey?: string | null;
  payloadSafe?: Record<string, unknown>;
};

/** Input for events poll query. */
export type ListBlsHttpWorkflowEventsInput = {
  applicationId: string;
  workflowId: string;
  sinceEventId: number;
  limit: number;
};

/** POST /api/apps/:applicationId/bls-workflow body. */
export type StartBlsHttpWorkflowBody = {
  supersede?: boolean;
};

/** POST start response 201 — short control plane (REQ-023). */
export type StartBlsHttpWorkflowOut = {
  workflowId: string;
  status: string;
  applicationId: string;
};

/** POST …/retry body. */
export type RetryBlsHttpWorkflowBody = {
  taskId?: string;
};

/**
 * Short control response for retry / resume / pause / cancel.
 * No secrets; enqueue via status + nextRunAt only.
 */
export type BlsHttpWorkflowControlOut = {
  workflowId: string;
  status: string;
  nextRunAt: string | null;
};

/** Service input for manual retry. */
export type RetryBlsHttpWorkflowInput = {
  applicationId: string;
  workflowId: string;
  taskId?: string | null;
};

/** Service input for resume / pause / cancel. */
export type BlsHttpWorkflowControlInput = {
  applicationId: string;
  workflowId: string;
};

/** Minimal task row for manual-retry target resolution. */
export type BlsHttpWorkflowManualRetryTaskRow = {
  id: string;
  taskKey: string;
  status: string;
  ordinal: number;
};
