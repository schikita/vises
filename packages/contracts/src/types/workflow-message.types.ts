import type { MessageEnvelope } from './message-envelope.types';

export type WorkflowCreatedPayload = {
  workflowId: string;
  applicationId: string;
};

export type WorkflowSchedulePayload = {
  workflowId: string;
  applicationId: string;
  /** ISO-8601 timestamp */
  scheduledAt: string;
  batchId?: string;
};

export type WorkflowAbortReason = 'pause' | 'cancel' | 'supersede';

export type WorkflowAbortPayload = {
  workflowId: string;
  applicationId: string;
  reason: WorkflowAbortReason;
};

export type WorkflowResumePayload = {
  workflowId: string;
  applicationId: string;
};

export type WorkflowRetryPayload = {
  workflowId: string;
  applicationId: string;
};

export type WorkflowCreatedMessage = MessageEnvelope<WorkflowCreatedPayload>;
export type WorkflowScheduleMessage = MessageEnvelope<WorkflowSchedulePayload>;
export type WorkflowAbortMessage = MessageEnvelope<WorkflowAbortPayload>;
export type WorkflowResumeMessage = MessageEnvelope<WorkflowResumePayload>;
export type WorkflowRetryMessage = MessageEnvelope<WorkflowRetryPayload>;
