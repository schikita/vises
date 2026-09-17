import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { AppEnv } from '../config';
import { User } from '../database/entities/user.entity';
import { JWT_TTL_HOURS } from './constants';
import type { JwtPayload } from './types';
import { resolveJwtSecret } from './utils';

/** HS256 JWT parity with Python `auth.py` (REQ-003, DEC-005). */
@Injectable()
export class JwtTokenService {
  private readonly secret: string;
  private readonly hours = JWT_TTL_HOURS;

  constructor(config: ConfigService<AppEnv, true>) {
    this.secret = resolveJwtSecret(
      config.get('JWT_SECRET', { infer: true }),
      config.get('NODE_ENV', { infer: true }),
    );
  }

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
