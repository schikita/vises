import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { JwtTokenService } from './jwt.service';

/**
 * Bearer JWT gate (REQ-006):
 * missing → 401 «Нужен вход»;
 * bad/expired → «Сессия истекла»;
 * inactive / missing user → «Нет доступа».
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtTokenService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: User;
    }>();

    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new HttpException('Нужен вход', HttpStatus.UNAUTHORIZED);
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new HttpException('Нужен вход', HttpStatus.UNAUTHORIZED);
    }

    const payload = this.jwt.readToken(token);
    if (!payload) {
      throw new HttpException('Сессия истекла', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user || !user.active) {
      throw new HttpException('Нет доступа', HttpStatus.UNAUTHORIZED);
    }

    request.user = user;
    return true;
  }
}
