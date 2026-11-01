import type { Client } from '../../database/entities/client.entity';
import type { AnalyticsClientAgentRow } from '../types';

export const mapClientRowToAgent = (
  row: Pick<Client, 'agentId'>,
): AnalyticsClientAgentRow => ({
  agentId: row.agentId,
});
