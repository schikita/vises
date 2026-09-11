import { User } from '../../database/entities/user.entity';
import type { UserOut } from '../types';
import { formatIso } from '../utils';

export type { UserOut };

/** FastAPI `user_out` parity (REQ-002, REQ-008, REQ-010). */
export function userOut(user: User, withPassword = false): UserOut {
  return {
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
  };
}
