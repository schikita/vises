import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/database/entities/user.entity';

/** Reads the `User` attached by `JwtAuthGuard` (SUB-003). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);
