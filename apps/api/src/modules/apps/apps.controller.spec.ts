import {
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { StaffRole } from '@vises/contracts';
import { ROLES_KEY } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import type { RequestUser } from '../../shared/types';
import { AppsController } from './apps.controller';

type Handler = (...args: never[]) => unknown;

const createExecutionContext = (
  user: RequestUser | undefined,
  handler: Handler,
): ExecutionContext => {
  return {
    getHandler: (): unknown => handler,
    getClass: (): unknown => AppsController,
    switchToHttp: (): {
      getRequest: () => { user?: RequestUser };
    } => ({
      getRequest: (): { user?: RequestUser } => ({ user }),
    }),
  } as ExecutionContext;
};

describe('AppsController ACL (ASAU-TASK-004 / DEC-ASAU-006 / REQ-014)', (): void => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('gates DELETE to admin and superadmin only', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      AppsController.prototype.remove,
      AppsController,
    ]);
    expect(roles).toEqual(['admin', 'superadmin']);
  });

  it('RolesGuard rejects agent delete with forbidden_role', (): void => {
    const handler = AppsController.prototype.remove;
    expect.assertions(3);
    try {
      guard.canActivate(createExecutionContext({ role: 'agent' }, handler));
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('RolesGuard allows admin delete', (): void => {
    const handler = AppsController.prototype.remove;
    expect(
      guard.canActivate(createExecutionContext({ role: 'admin' }, handler)),
    ).toBe(true);
  });

  it('RolesGuard allows superadmin delete', (): void => {
    const handler = AppsController.prototype.remove;
    expect(
      guard.canActivate(
        createExecutionContext({ role: 'superadmin' }, handler),
      ),
    ).toBe(true);
  });
});
