import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../database/entities/user.entity';
import { INSECURE_DEFAULT_SECRET, JWT_TTL_HOURS } from './constants';
import type { JwtPayload } from './types';

/** DEC-007: refuse insecure JWT secret when NODE_ENV=production. */
function resolveJwtSecret(): string {
  const raw = process.env.JWT_SECRET?.trim() ?? '';
  const secret = raw || INSECURE_DEFAULT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!raw || raw === INSECURE_DEFAULT_SECRET) {
      throw new Error(
        'JWT_SECRET must be set to a non-default value when NODE_ENV=production ' +
          `(do not use "${INSECURE_DEFAULT_SECRET}"). Set JWT_SECRET in the environment.`,
      );
    }
  }

  return secret;
}

/** HS256 JWT parity with Python `auth.py` (REQ-003, DEC-005). */
@Injectable()
export class JwtTokenService {
  private readonly secret = resolveJwtSecret();
  private readonly hours = JWT_TTL_HOURS;

  makeToken(user: User): string {
    return jwt.sign(
      { sub: user.id, role: user.role } satisfies JwtPayload,
      this.secret,
      { algorithm: 'HS256', expiresIn: `${this.hours}h` },
    );
  }

  readToken(token: string): JwtPayload | null {
    try {
      const payload = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;
      if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
        return null;
      }
      return { sub: payload.sub, role: payload.role };
    } catch {
      return null;
    }
  }
}
