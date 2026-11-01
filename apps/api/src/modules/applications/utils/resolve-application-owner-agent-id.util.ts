import type { EntityManager } from 'typeorm';
import { Client } from '../../database/entities/client.entity';
import { throwApplicationNotFound } from './throw-application-not-found.util';

/**
 * Resolve owning agent via Application.clientId → Client.agentId (FR-5 / FR-7.4).
 */
export const resolveApplicationOwnerAgentId = async (
  manager: EntityManager,
  clientId: string,
): Promise<string> => {
  const client = await manager.findOne(Client, { where: { id: clientId } });
  if (!client) {
    return throwApplicationNotFound();
  }
  return client.agentId;
};
