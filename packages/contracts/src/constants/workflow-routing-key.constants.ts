/**
 * RabbitMQ routing keys for workflow bus messages.
 * Keys travel on the AMQP envelope, not inside MessageEnvelope JSON (DEC-022).
 */
export const WORKFLOW_ROUTING_KEYS = {
  CREATED: 'workflow.created',
  SCHEDULE: 'workflow.schedule',
  ABORT: 'workflow.abort',
  RESUME: 'workflow.resume',
  RETRY: 'workflow.retry',
} as const;
