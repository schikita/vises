import { User } from '../../modules/database/entities/user.entity';
import type { UserOut } from '../types';
import { formatIso } from '../utils';

/** FastAPI `user_out` parity (REQ-002, REQ-008, REQ-010). */
export const userOut = (user: User, withPassword = false): UserOut => ({
  id: user.id,
  name: user.name,
  login: user.login,
  email: user.email,
  role: user.role,
  active: user.active,
  inviteToken: user.inviteToken,
  createdAt: formatIso(user.createdAt),
  updatedAt: formatIso(user.updatedAt),
  password: withPassword ? user.invitePassword : '',
});
