import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { StaffRole } from '@vises/contracts';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestUser } from '../types';

/**
 * Fail-closed StaffRole ACL (FR-1 / FR-12 / NFR-6).
 * Must run after `JwtAuthGuard` so `request.user` is set.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw new HttpException(
        { detail: 'forbidden_role' },
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
