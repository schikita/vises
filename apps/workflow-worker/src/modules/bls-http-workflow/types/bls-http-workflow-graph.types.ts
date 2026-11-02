import type { BlsHttpWorkflow } from '../../database/entities/bls-http-workflow.entity';
import type { BlsHttpWorkflowStep } from '../../database/entities/bls-http-workflow-step.entity';
import type { BlsHttpWorkflowTask } from '../../database/entities/bls-http-workflow-task.entity';
import type { BlsHttpWorkflowStepKey } from './bls-http-workflow.types';

/** Draft task row before persistence (create graph). */
export type BlsHttpWorkflowTaskDraft = {
  taskKey: string;
  applicantId: string | null;
  ordinal: number;
};

/** Draft step + nested tasks before persistence. */
export type BlsHttpWorkflowStepDraft = {
  stepKey: BlsHttpWorkflowStepKey;
  ordinal: number;
  tasks: BlsHttpWorkflowTaskDraft[];
};

/** Full in-memory graph draft for create. */
export type BlsHttpWorkflowGraphDraft = {
  steps: BlsHttpWorkflowStepDraft[];
};

/** Loaded workflow with ordered steps and tasks (flat task list). */
export type BlsHttpWorkflowGraph = {
  workflow: BlsHttpWorkflow;
  steps: BlsHttpWorkflowStep[];
  tasks: BlsHttpWorkflowTask[];
};

/** Pure advance plan after a task is marked COMPLETED (REQ-002 / DEC-010). */
export type BlsHttpWorkflowAdvancePlan = {
  completedStepId: string | null;
  nextTaskId: string | null;
  nextStepKey: string | null;
  nextTaskKey: string | null;
  /** When true, workflow → AWAITING_STAFF_BOOKING (BOOK done). */
  bookSuccessTerminal: boolean;
};

/** Minimal step row for pure advance / next-task helpers. */
export type BlsHttpWorkflowStepCursorRow = {
  id: string;
  stepKey: string;
  ordinal: number;
};

/** Minimal task row for pure advance / next-task helpers. */
export type BlsHttpWorkflowTaskCursorRow = {
  id: string;
  stepId: string;
  taskKey: string;
  ordinal: number;
  status: string;
};

/** Create-workflow service input (applicants loaded from CRM). */
export type CreateBlsHttpWorkflowInput = {
  applicationId: string;
  supersede?: boolean;
  triggeredByUserId?: string | null;
};

/** Advance / complete-task input — verify flag required (REQ-007). */
export type AdvanceBlsHttpWorkflowInput = {
  workflowId: string;
  taskId: string;
  /** Must be true after external portal verify; gates COMPLETED. */
  verifiedExternalState: boolean;
};

/** Skip conditional step (PASSWORD_CHANGE). */
export type SkipBlsHttpWorkflowStepInput = {
  workflowId: string;
  stepKey: BlsHttpWorkflowStepKey;
  reason: string;
};

/** Fail task (+ optional terminal workflow). */
export type FailBlsHttpWorkflowTaskInput = {
  workflowId: string;
  taskId: string;
  errorClass: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  /** Default true → workflow FAILED. */
  terminalWorkflow?: boolean;
};

/** Abandon / supersede terminal. */
export type AbandonBlsHttpWorkflowInput = {
  workflowId: string;
  reason?: string | null;
};
