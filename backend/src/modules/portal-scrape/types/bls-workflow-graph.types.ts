import type { BlsWorkflow } from '../../database/entities/bls-workflow.entity';
import type { BlsWorkflowStep } from '../../database/entities/bls-workflow-step.entity';
import type { BlsWorkflowTask } from '../../database/entities/bls-workflow-task.entity';
import type { BlsWorkflowStepKey } from './bls-workflow.types';

/** Draft task row before persistence (create graph). */
export type BlsWorkflowTaskDraft = {
  taskKey: string;
  applicantId: string | null;
  ordinal: number;
};

/** Draft step + nested tasks before persistence. */
export type BlsWorkflowStepDraft = {
  stepKey: BlsWorkflowStepKey;
  ordinal: number;
  tasks: BlsWorkflowTaskDraft[];
};

/** Full in-memory graph draft for create. */
export type BlsWorkflowGraphDraft = {
  steps: BlsWorkflowStepDraft[];
};

/** Loaded workflow with ordered steps and tasks (flat task list). */
export type BlsWorkflowGraph = {
  workflow: BlsWorkflow;
  steps: BlsWorkflowStep[];
  tasks: BlsWorkflowTask[];
};

/** Pure advance plan after a task is marked COMPLETED (REQ-002 / DEC-010). */
export type BlsWorkflowAdvancePlan = {
  completedStepId: string | null;
  nextTaskId: string | null;
  nextStepKey: string | null;
  nextTaskKey: string | null;
  /** When true, workflow → AWAITING_STAFF_BOOKING (BOOK done). */
  bookSuccessTerminal: boolean;
};

/** Minimal step row for pure advance / next-task helpers. */
export type BlsWorkflowStepCursorRow = {
  id: string;
  stepKey: string;
  ordinal: number;
};

/** Minimal task row for pure advance / next-task helpers. */
export type BlsWorkflowTaskCursorRow = {
  id: string;
  stepId: string;
  taskKey: string;
  ordinal: number;
  status: string;
};

/** Create-workflow service input (applicants loaded from CRM). */
export type CreateBlsWorkflowInput = {
  applicationId: string;
  supersede?: boolean;
  triggeredByUserId?: string | null;
};

/** Advance / complete-task input — verify flag required (REQ-007). */
export type AdvanceBlsWorkflowInput = {
  workflowId: string;
  taskId: string;
  /** Must be true after external portal verify; gates COMPLETED. */
  verifiedExternalState: boolean;
};

/** Skip conditional step (PASSWORD_CHANGE). */
export type SkipBlsWorkflowStepInput = {
  workflowId: string;
  stepKey: BlsWorkflowStepKey;
  reason: string;
};

/** Fail task (+ optional terminal workflow). */
export type FailBlsWorkflowTaskInput = {
  workflowId: string;
  taskId: string;
  errorClass: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  /** Default true → workflow FAILED. */
  terminalWorkflow?: boolean;
};

/** Abandon / supersede terminal. */
export type AbandonBlsWorkflowInput = {
  workflowId: string;
  reason?: string | null;
};
