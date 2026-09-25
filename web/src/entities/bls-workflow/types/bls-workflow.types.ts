/** Step row from GET …/bls-workflow snapshot. */
export type BlsWorkflowStep = {
  stepKey: string
  ordinal: number
  status: string
  skipReason: string | null
}

/** Task row from GET …/bls-workflow snapshot (DEC-003: id + maxAttempts). */
export type BlsWorkflowTask = {
  id: string
  stepKey: string
  taskKey: string
  applicantId: string | null
  ordinal: number
  status: string
  attemptCount: number
  maxAttempts: number
  lastErrorClass: string | null
  lastErrorMessage: string | null
}

/** GET /api/apps/:applicationId/bls-workflow — no secrets (REQ-024). */
export type BlsWorkflowSnapshot = {
  workflowId: string
  applicationId: string
  status: string
  currentStepKey: string | null
  currentTaskKey: string | null
  nextRunAt: string | null
  lockHeld: boolean
  terminalReason: string | null
  steps: BlsWorkflowStep[]
  tasks: BlsWorkflowTask[]
  updatedAt: string
}

/** POST /api/apps/:applicationId/bls-workflow body. */
export type StartBlsWorkflowBody = {
  supersede?: boolean
}

/** POST start response 201. */
export type StartBlsWorkflowResult = {
  workflowId: string
  status: string
  applicationId: string
}

/** POST …/retry body. */
export type RetryBlsWorkflowBody = {
  taskId?: string
}

/** Short control response for retry / resume / pause / cancel. */
export type BlsWorkflowControlResult = {
  workflowId: string
  status: string
  nextRunAt: string | null
}

/** Safe error surface for staff UI (never secrets). */
export type BlsWorkflowSafeError = {
  errorClass: string | null
  errorMessage: string | null
  taskKey: string | null
}
