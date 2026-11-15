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
import { ClientsController } from './clients.controller';

type Handler = (...args: never[]) => unknown;

const createExecutionContext = (
  user: RequestUser | undefined,
  handler: Handler,
): ExecutionContext => {
  return {
    getHandler: (): unknown => handler,
    getClass: (): unknown => ClientsController,
    switchToHttp: (): {
      getRequest: () => { user?: RequestUser };
    } => ({
      getRequest: (): { user?: RequestUser } => ({ user }),
    }),
  } as ExecutionContext;
};

describe('ClientsController ACL metadata (T8 / §6.5 / FR-5 / FR-8)', (): void => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('gates create to agent only (AC-6)', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      ClientsController.prototype.create,
      ClientsController,
    ]);
    expect(roles).toEqual(['agent']);
  });

  it('RolesGuard rejects admin create with forbidden_role (AC-6)', (): void => {
    const handler = ClientsController.prototype.create;
    expect.assertions(3);
    try {
      guard.canActivate(createExecutionContext({ role: 'admin' }, handler));
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('RolesGuard rejects superadmin create with forbidden_role (AC-6)', (): void => {
    const handler = ClientsController.prototype.create;
    expect.assertions(2);
    try {
      guard.canActivate(
        createExecutionContext({ role: 'superadmin' }, handler),
      );
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('RolesGuard allows agent create', (): void => {
    const handler = ClientsController.prototype.create;
    expect(
      guard.canActivate(createExecutionContext({ role: 'agent' }, handler)),
    ).toBe(true);
  });

  it('gates delete to admin and superadmin (AC-17)', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      ClientsController.prototype.remove,
      ClientsController,
    ]);
    expect(roles).toEqual(['admin', 'superadmin']);
  });

  it('RolesGuard rejects agent delete with forbidden_role (AC-17)', (): void => {
    const handler = ClientsController.prototype.remove;
    expect.assertions(2);
    try {
      guard.canActivate(createExecutionContext({ role: 'agent' }, handler));
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('allows staff roles on list, passport, and portal-form paths', (): void => {
    for (const handler of [
      ClientsController.prototype.list,
      ClientsController.prototype.getById,
      ClientsController.prototype.getPassport,
      ClientsController.prototype.updatePassport,
      ClientsController.prototype.updatePortalForm,
    ]) {
      const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
        handler,
        ClientsController,
      ]);
      expect(roles).toEqual(['admin', 'superadmin', 'agent']);
    }
  });
});
