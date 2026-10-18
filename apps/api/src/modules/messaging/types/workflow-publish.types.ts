import type { MessageEnvelope, WorkflowRoutingKey } from '@vises/contracts';

export type PublishWorkflowMessageInput = {
  routingKey: WorkflowRoutingKey;
  message: MessageEnvelope;
};
