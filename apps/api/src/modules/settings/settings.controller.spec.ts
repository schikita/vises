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
import { SettingsController } from './settings.controller';

type PatchHandler = typeof SettingsController.prototype.patch;

/**
 * Typed stub covering the ExecutionContext surface RolesGuard reads.
 * Handler/class returns are widened to `unknown` so a single assertion to
 * ExecutionContext is valid (same harness style as roles.guard.spec.ts).
 */
const createExecutionContext = (
  user: RequestUser | undefined,
  handler: PatchHandler,
): ExecutionContext => {
  return {
    getHandler: (): unknown => handler,
    getClass: (): unknown => SettingsController,
    switchToHttp: (): {
      getRequest: () => { user?: RequestUser };
    } => ({
      getRequest: (): { user?: RequestUser } => ({ user }),
    }),
  } as ExecutionContext;
};

describe('SettingsController ACL (FR-3 / AC-4)', (): void => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const patchHandler = SettingsController.prototype.patch;

  it('requires admin or superadmin on PATCH', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      patchHandler,
      SettingsController,
    ]);
    expect(roles).toEqual(['admin', 'superadmin']);
  });

  it('requires admin or superadmin on reset-demo', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      SettingsController.prototype.resetDemo,
      SettingsController,
    ]);
    expect(roles).toEqual(['admin', 'superadmin']);
  });

  it('allows admin and superadmin to PATCH; forbids agent', (): void => {
    expect(
      guard.canActivate(
        createExecutionContext({ role: 'admin' }, patchHandler),
      ),
    ).toBe(true);

    expect(
      guard.canActivate(
        createExecutionContext({ role: 'superadmin' }, patchHandler),
      ),
    ).toBe(true);

    expect((): boolean =>
      guard.canActivate(
        createExecutionContext({ role: 'agent' }, patchHandler),
      ),
    ).toThrow(HttpException);

    try {
      guard.canActivate(
        createExecutionContext({ role: 'agent' }, patchHandler),
      );
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    }
  });

  it('does not attach Roles metadata to GET (any authenticated staff)', (): void => {
    const roles = reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      SettingsController.prototype.get,
      SettingsController,
    ]);
    expect(roles).toBeUndefined();
  });
});
