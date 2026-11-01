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
import { BalanceController } from './balance.controller';

type Handler = (...args: never[]) => unknown;

const createExecutionContext = (
  user: RequestUser | undefined,
  handler: Handler,
): ExecutionContext => {
  return {
    getHandler: (): unknown => handler,
    getClass: (): unknown => BalanceController,
    switchToHttp: (): {
      getRequest: () => { user?: RequestUser };
    } => ({
      getRequest: (): { user?: RequestUser } => ({ user }),
    }),
  } as ExecutionContext;
};

describe('BalanceController ACL metadata (T7 / §6.4 / FR-4)', (): void => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('gates top-up and adjust to admin and superadmin', (): void => {
    for (const handler of [
      BalanceController.prototype.topUp,
      BalanceController.prototype.adjust,
    ]) {
      const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
        handler,
        BalanceController,
      ]);
      expect(roles).toEqual(['admin', 'superadmin']);
    }
  });

  it('allows admin, superadmin, and agent on ledger list', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      BalanceController.prototype.listTransactions,
      BalanceController,
    ]);
    expect(roles).toEqual(['admin', 'superadmin', 'agent']);
  });

  it('RolesGuard rejects agent self top-up with forbidden_role', (): void => {
    const handler = BalanceController.prototype.topUp;
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

  it('RolesGuard allows admin on top-up', (): void => {
    const handler = BalanceController.prototype.topUp;
    expect(
      guard.canActivate(createExecutionContext({ role: 'admin' }, handler)),
    ).toBe(true);
  });
});
