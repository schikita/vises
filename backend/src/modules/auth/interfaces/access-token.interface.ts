import type { User } from '../../database/entities/user.entity';
import type { JwtPayload } from '../types';

/** Access-token issue / verify port (algorithm-agnostic). */
export interface IAccessToken {
  makeToken(user: User): string;
  readToken(token: string): JwtPayload | null;
}
