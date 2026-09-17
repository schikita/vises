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
 * missing → 401 "Login required";
 * bad/expired → "Session expired";
 * inactive / missing user → "No access".
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
      throw new HttpException('Login required', HttpStatus.UNAUTHORIZED);
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new HttpException('Login required', HttpStatus.UNAUTHORIZED);
    }

    const payload = this.jwt.readToken(token);
    if (!payload) {
      throw new HttpException('Session expired', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user || !user.active) {
      throw new HttpException('Access denied', HttpStatus.UNAUTHORIZED);
    }

    request.user = user;
    return true;
  }
}
