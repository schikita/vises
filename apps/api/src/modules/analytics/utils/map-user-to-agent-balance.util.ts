import type { User } from '../../database/entities/user.entity';
import type { AnalyticsAgentBalanceRow } from '../types';
import { normalizeAgentBalance } from './normalize-agent-balance.util';

export const mapUserToAgentBalance = (
  user: Pick<User, 'id' | 'balance'>,
): AnalyticsAgentBalanceRow => ({
  agentId: user.id,
  balance: normalizeAgentBalance(user.balance),
});
