/**
 * @vises/contracts — shared envelope + workflow message contracts (DEC-022).
 *
 * Future App3 (availability-searcher) publishes batched `workflow.schedule`
 * with `payload.scheduledAt` + optional `payload.batchId`. No App3 impl here.
 */
export type {
  AppsUpsertArmPayload,
  AppsUpsertArmResponse,
  MessageEnvelope,
  WorkflowAbortMessage,
  WorkflowAbortPayload,
  WorkflowAbortReason,
  WorkflowCreatedMessage,
  WorkflowCreatedPayload,
  WorkflowResumeMessage,
  WorkflowResumePayload,
  WorkflowRetryMessage,
  WorkflowRetryPayload,
  WorkflowRoutingKey,
  WorkflowScheduleMessage,
  WorkflowSchedulePayload,
} from './types';
export { WORKFLOW_ROUTING_KEYS } from './constants';
