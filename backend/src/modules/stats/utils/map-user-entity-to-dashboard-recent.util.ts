import type { User } from '../../database/entities/user.entity';
import type { DashboardRecentUser } from '../types/dashboard-recent-user.types';

/** Map TypeORM user entity → dashboard recent-user DTO. */
export const mapUserEntityToDashboardRecent = (
  row: User,
): DashboardRecentUser => ({
  id: row.id,
  name: row.name,
  login: row.login,
  email: row.email,
  role: row.role,
  active: row.active,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
