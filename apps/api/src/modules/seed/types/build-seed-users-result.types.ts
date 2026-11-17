import type { User } from '../../database/entities/user.entity';
import type { SeedAgentPlan } from './seed-agent-plan.types';

export type BuildSeedUsersResult = {
  users: User[];
  superadminId: string;
  agentPlans: SeedAgentPlan[];
};
