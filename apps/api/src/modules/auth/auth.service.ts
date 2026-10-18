import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { User } from '../database/entities/user.entity';
import { userOut } from '../../shared/mappers';
import { checkPassword } from '../../shared/utils';
import type { UserOut } from '../users/types';
import { USER_ROLES } from './constants';
import type { IAuthService } from './interfaces';
import { JwtTokenService } from './jwt.service';
import type { AuthSession, UserMeOut } from './types';
import { isDemoAuthEnabled } from './utils';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtTokenService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  async login(login: string, password: string): Promise<AuthSession> {
    const needle = login.trim().toLowerCase();
    const user = await this.users
      .createQueryBuilder('u')
      .where('LOWER(u.login) = :needle OR LOWER(u.email) = :needle', { needle })
      .getOne();

    if (!user) {
      throw new HttpException('Login not found', HttpStatus.BAD_REQUEST);
    }
    if (!user.active) {
      throw new HttpException('Access disabled', HttpStatus.BAD_REQUEST);
    }
    if (!checkPassword(password, user.passwordHash)) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    return { token: this.jwt.makeToken(user), user: userOut(user) };
  }

  async demo(role: string): Promise<AuthSession> {
    if (
      !isDemoAuthEnabled(
        this.config.get('DEMO_AUTH_ENABLED', { infer: true }),
        this.config.get('NODE_ENV', { infer: true }),
      )
    ) {
      throw new HttpException('Demo login is disabled', HttpStatus.FORBIDDEN);
    }

    if (!(USER_ROLES as readonly string[]).includes(role)) {
      throw new HttpException('Unknown role', HttpStatus.BAD_REQUEST);
    }

    const user = await this.users.findOne({
      where: { role, active: true },
    });
    if (!user) {
      throw new HttpException(
        'No user with this role',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { token: this.jwt.makeToken(user), user: userOut(user) };
  }

  me(user: User): UserMeOut {
    const { password: _password, ...rest } = userOut(user);
    return rest;
  }

  /** DEC-002: one-time plaintext reveal; clear invite_password after first non-empty GET. */
  async invite(token: string): Promise<UserOut> {
    const user = await this.users.findOne({ where: { inviteToken: token } });
    if (!user) {
      throw new HttpException('Invalid link', HttpStatus.NOT_FOUND);
    }

    const revealed = user.invitePassword || '';
    if (revealed) {
      user.invitePassword = '';
      user.updatedAt = new Date();
      await this.users.save(user);
    }

    return { ...userOut(user, false), password: revealed };
  }
}
