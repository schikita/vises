/**
 * Staff HTTP DTOs for durable BLS workflow snapshot, events poll, and control (TASK-013/014).
 * Never include vault secrets, lockOwner, Mail.tm tokens, or DEK material.
 */

/** Step row in GET bls-workflow snapshot. */
export type BlsWorkflowStepOut = {
  stepKey: string;
  ordinal: number;
  status: string;
  skipReason: string | null;
};

/** Task row in GET bls-workflow snapshot. */
export type BlsWorkflowTaskOut = {
  stepKey: string;
  taskKey: string;
  applicantId: string | null;
  ordinal: number;
  status: string;
  attemptCount: number;
  lastErrorClass: string | null;
  lastErrorMessage: string | null;
};

/** GET /api/apps/:applicationId/bls-workflow (and by id) — no secrets (REQ-024). */
export type BlsWorkflowOut = {
  workflowId: string;
  applicationId: string;
  status: string;
  currentStepKey: string | null;
  currentTaskKey: string | null;
  nextRunAt: string | null;
  lockHeld: boolean;
  terminalReason: string | null;
  steps: BlsWorkflowStepOut[];
  tasks: BlsWorkflowTaskOut[];
  updatedAt: string;
};

/** Single append-only event in poll response (REQ-029 / DEC-020). */
export type BlsWorkflowEventOut = {
  id: number;
  eventType: string;
  stepKey: string | null;
  taskKey: string | null;
  payloadSafe: Record<string, unknown>;
  createdAt: string;
};

/** GET …/bls-workflow/:workflowId/events?sinceEventId=&limit= */
export type BlsWorkflowEventsOut = {
  workflowId: string;
  workflowStatus: string;
  events: BlsWorkflowEventOut[];
  latestEventId: number | null;
};

/** Input for append-only event persistence (runner / state transitions). */
export type AppendBlsWorkflowEventInput = {
  workflowId: string;
  eventType: string;
  stepKey?: string | null;
  taskKey?: string | null;
  payloadSafe?: Record<string, unknown>;
};

/** Input for events poll query. */
export type ListBlsWorkflowEventsInput = {
  applicationId: string;
  workflowId: string;
  sinceEventId: number;
  limit: number;
};

/** POST /api/apps/:applicationId/bls-workflow body. */
export type StartBlsWorkflowBody = {
  supersede?: boolean;
};

/** POST start response 201 — short control plane (REQ-023). */
export type StartBlsWorkflowOut = {
  workflowId: string;
  status: string;
  applicationId: string;
};

/** POST …/retry body. */
export type RetryBlsWorkflowBody = {
  taskId?: string;
};

/**
 * Short control response for retry / resume / pause / cancel.
 * No secrets; enqueue via status + nextRunAt only.
 */
export type BlsWorkflowControlOut = {
  workflowId: string;
  status: string;
  nextRunAt: string | null;
};

/** Service input for manual retry. */
export type RetryBlsWorkflowInput = {
  applicationId: string;
  workflowId: string;
  taskId?: string | null;
};

/** Service input for resume / pause / cancel. */
export type BlsWorkflowControlInput = {
  applicationId: string;
  workflowId: string;
};

/** Minimal task row for manual-retry target resolution. */
export type BlsWorkflowManualRetryTaskRow = {
  id: string;
  taskKey: string;
  status: string;
  ordinal: number;
};
