import type { User } from '../../database/entities/user.entity';

export type BuildSeedUsersResult = {
  users: User[];
  superadminId: string;
  agentAId: string;
  agentBId: string;
};
