import type { MessageEnvelope } from './message-envelope.types';

export type AppsUpsertArmPayload = {
  applicationId: string;
  workflowId?: string;
  workflowAction: 'ensure' | 'supersede' | 'none';
  created: boolean;
};

/** HTTP response for apps upsert when arming a workflow (DEC-022 §6.3). */
export type AppsUpsertArmResponse = MessageEnvelope<AppsUpsertArmPayload>;
