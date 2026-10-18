/** AMQP routing keys — not JSON envelope fields (DEC-022). */
export type WorkflowRoutingKey =
  | 'workflow.created'
  | 'workflow.schedule'
  | 'workflow.abort'
  | 'workflow.resume'
  | 'workflow.retry';
