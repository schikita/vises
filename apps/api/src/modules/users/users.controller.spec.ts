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
import { UsersController } from './users.controller';

type Handler = (...args: never[]) => unknown;

const createExecutionContext = (
  user: RequestUser | undefined,
  handler: Handler,
): ExecutionContext => {
  return {
    getHandler: (): unknown => handler,
    getClass: (): unknown => UsersController,
    switchToHttp: (): {
      getRequest: () => { user?: RequestUser };
    } => ({
      getRequest: (): { user?: RequestUser } => ({ user }),
    }),
  } as ExecutionContext;
};

describe('UsersController ACL metadata (T5 / §6.2 / FR-12)', (): void => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('lists users for admin and superadmin only', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      UsersController.prototype.list,
      UsersController,
    ]);
    expect(roles).toEqual(['admin', 'superadmin']);
  });

  it('allows admin, superadmin, and agent on remapped /managers', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      UsersController.prototype.listManagers,
      UsersController,
    ]);
    expect(roles).toEqual(['admin', 'superadmin', 'agent']);
  });

  it('gates write routes to admin and superadmin', (): void => {
    for (const handler of [
      UsersController.prototype.create,
      UsersController.prototype.patch,
      UsersController.prototype.reissue,
      UsersController.prototype.remove,
    ]) {
      const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
        handler,
        UsersController,
      ]);
      expect(roles).toEqual(['admin', 'superadmin']);
    }
  });

  it('RolesGuard allows superadmin on list and forbids agent', (): void => {
    const handler = UsersController.prototype.list;
    expect(
      guard.canActivate(
        createExecutionContext({ role: 'superadmin' }, handler),
      ),
    ).toBe(true);

    expect((): boolean =>
      guard.canActivate(createExecutionContext({ role: 'agent' }, handler)),
    ).toThrow(HttpException);

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
});
