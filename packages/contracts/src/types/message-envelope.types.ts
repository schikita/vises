/**
 * Normative shared communication envelope (DEC-022 simplified).
 * RabbitMQ body and workflow-arming HTTP responses use this shape only.
 * Routing key / URL live outside the body — not as envelope fields.
 */
export type MessageEnvelope<TPayload = unknown> = {
  correlationId: string;
  payload: TPayload;
};
