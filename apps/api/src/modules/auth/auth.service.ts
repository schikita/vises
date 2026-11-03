import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { StaffRole, UserMeDto } from '@vises/contracts';
import { Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { User } from '../database/entities/user.entity';
import { userOut } from '../../shared/mappers';
import type { UserOut } from '../../shared/types';
import { checkPassword, hashPassword, uid } from '../../shared/utils';
import { AGENT_ROLE } from './constants';
import type { RegisterDto } from './dto/register.dto';
import type { IAuthService } from './interfaces';
import { JwtTokenService } from './jwt.service';
import type { AuthSession } from './types';
import {
  deriveRegisterDisplayName,
  formatAgentBalance,
  isDemoAuthEnabled,
  isStaffRole,
  normalizeOptionalName,
} from './utils';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtTokenService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  async login(identifier: string, password: string): Promise<AuthSession> {
    const needle = identifier.trim().toLowerCase();
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

  /**
   * Public registration (FR-2 / §6.1): always creates an active agent.
   * Does not create clients or applications. Role override is rejected.
   */
  async register(body: RegisterDto): Promise<AuthSession> {
    if (body.role !== undefined && body.role !== AGENT_ROLE) {
      throw new HttpException(
        'Role override not allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const login = body.login.trim().toLowerCase();
    if (!login) {
      throw new HttpException('Login is required', HttpStatus.BAD_REQUEST);
    }

    const email = body.email.trim().toLowerCase();
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    const password = body.password;
    if (!password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.users.findOne({ where: { login } });
    if (existing) {
      throw new HttpException('Login already exists', HttpStatus.BAD_REQUEST);
    }

    const firstName = normalizeOptionalName(body.firstName);
    const lastName = normalizeOptionalName(body.lastName);
    const name = deriveRegisterDisplayName({
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      login,
    });

    const now = new Date();
    const row = this.users.create({
      id: uid('u'),
      name,
      firstName,
      lastName,
      login,
      email,
      passwordHash: hashPassword(password),
      invitePassword: '',
      role: AGENT_ROLE,
      balance: '0',
      active: true,
      inviteToken: uid('inv'),
      createdAt: now,
      updatedAt: now,
    });

    await this.users.save(row);
    return { token: this.jwt.makeToken(row), user: userOut(row) };
  }

  async demo(role: StaffRole): Promise<AuthSession> {
    if (
      !isDemoAuthEnabled(
        this.config.get('DEMO_AUTH_ENABLED', { infer: true }),
        this.config.get('NODE_ENV', { infer: true }),
      )
    ) {
      throw new HttpException('Demo login is disabled', HttpStatus.FORBIDDEN);
    }

    if (!isStaffRole(role)) {
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

  me(user: User): UserMeDto {
    const balance =
      user.role === AGENT_ROLE ? formatAgentBalance(user.balance) : null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
      balance,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
    };
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
