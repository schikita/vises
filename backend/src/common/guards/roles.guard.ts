import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../../database/entities/user.entity';

/**
 * FastAPI `require_roles` equivalent (REQ-005, REQ-006, SUB-003).
 * Must run after `JwtAuthGuard` so `request.user` is set.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw new HttpException('Недостаточно прав', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
