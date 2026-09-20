import type { User } from '../../database/entities/user.entity';
import type { SeedClientProfile } from './seed-client-profile.types';

export type BuildSeedUsersResult = {
  users: User[];
  clients: SeedClientProfile[];
  managerNames: string[];
};
