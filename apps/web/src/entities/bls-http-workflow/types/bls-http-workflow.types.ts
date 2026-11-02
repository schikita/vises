/** Step row from GET …/bls-http-workflow snapshot. */
export type BlsHttpWorkflowStep = {
  stepKey: string
  ordinal: number
  status: string
  skipReason: string | null
}

/** Task row from GET …/bls-http-workflow snapshot (DEC-003: id + maxAttempts). */
export type BlsHttpWorkflowTask = {
  id: string
  stepKey: string
  taskKey: string
  applicantId: string | null
  ordinal: number
  status: string
  attemptCount: number
  maxAttempts: number
  lastErrorClass: string | null
  lastErrorCode: string | null
  lastErrorMessage: string | null
}

/** GET /api/apps/:applicationId/bls-http-workflow — no secrets (REQ-024). */
export type BlsHttpWorkflowSnapshot = {
  workflowId: string
  applicationId: string
  status: string
  currentStepKey: string | null
  currentTaskKey: string | null
  nextRunAt: string | null
  lockHeld: boolean
  terminalReason: string | null
  steps: BlsHttpWorkflowStep[]
  tasks: BlsHttpWorkflowTask[]
  updatedAt: string
}

/** POST /api/apps/:applicationId/bls-http-workflow body. */
export type StartBlsHttpWorkflowBody = {
  supersede?: boolean
}

/** POST start response 201. */
export type StartBlsHttpWorkflowResult = {
  workflowId: string
  status: string
  applicationId: string
}

/** POST …/retry body. */
export type RetryBlsHttpWorkflowBody = {
  taskId?: string
}

/** Short control response for retry / resume / pause / cancel. */
export type BlsHttpWorkflowControlResult = {
  workflowId: string
  status: string
  nextRunAt: string | null
}

/** Safe error surface for staff UI (never secrets). */
export type BlsHttpWorkflowSafeError = {
  errorClass: string | null
  errorCode: string | null
  errorMessage: string | null
  taskKey: string | null
}
