import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { userOut } from '../common/mappers';
import { checkPassword } from '../common/utils';
import type { UserOut } from '../users/types';
import { USER_ROLES } from './constants';
import type { IAuthService } from './interfaces';
import { JwtTokenService } from './jwt.service';
import type { AuthSession } from './types';

/** DEC-001: truthy 1/true/yes; falsy 0/false/no; unset → on iff not production. */
function isDemoAuthEnabled(): boolean {
  const raw = process.env.DEMO_AUTH_ENABLED?.trim();
  if (raw) {
    const v = raw.toLowerCase();
    if (['1', 'true', 'yes'].includes(v)) return true;
    if (['0', 'false', 'no'].includes(v)) return false;
  }
  return process.env.NODE_ENV !== 'production';
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtTokenService,
  ) {}

  async login(login: string, password: string): Promise<AuthSession> {
    const needle = login.trim().toLowerCase();
    const user = await this.users
      .createQueryBuilder('u')
      .where('LOWER(u.login) = :needle OR LOWER(u.email) = :needle', { needle })
      .getOne();

    if (!user) {
      throw new HttpException('Нет такого логина', HttpStatus.BAD_REQUEST);
    }
    if (!user.active) {
      throw new HttpException('Доступ отключён', HttpStatus.BAD_REQUEST);
    }
    if (!checkPassword(password, user.passwordHash)) {
      throw new HttpException('Неверный пароль', HttpStatus.BAD_REQUEST);
    }

    return { token: this.jwt.makeToken(user), user: userOut(user) };
  }

  async demo(role: string): Promise<AuthSession> {
    if (!isDemoAuthEnabled()) {
      throw new HttpException('Демо-вход отключён', HttpStatus.FORBIDDEN);
    }

    if (!(USER_ROLES as readonly string[]).includes(role)) {
      throw new HttpException('Неизвестная роль', HttpStatus.BAD_REQUEST);
    }

    const user = await this.users.findOne({
      where: { role, active: true },
    });
    if (!user) {
      throw new HttpException(
        'Нет пользователя с этой ролью',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { token: this.jwt.makeToken(user), user: userOut(user) };
  }

  me(user: User): UserOut {
    return userOut(user);
  }

  /** DEC-002: one-time plaintext reveal; clear invite_password after first non-empty GET. */
  async invite(token: string): Promise<UserOut> {
    const user = await this.users.findOne({ where: { inviteToken: token } });
    if (!user) {
      throw new HttpException('Ссылка недействительна', HttpStatus.NOT_FOUND);
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
