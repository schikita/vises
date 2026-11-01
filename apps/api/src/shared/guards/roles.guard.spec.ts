import {
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { StaffRole } from '@vises/contracts';
import { Roles, ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestUser } from '../types';
import { RolesGuard } from './roles.guard';

class AdminSuperadminHandler {
  @Roles('admin', 'superadmin')
  handle(): void {
    return undefined;
  }
}

class AdminOnlyHandler {
  @Roles('admin')
  handle(): void {
    return undefined;
  }
}

class AgentOnlyHandler {
  @Roles('agent')
  handle(): void {
    return undefined;
  }
}

class NoRolesHandler {
  handle(): void {
    return undefined;
  }
}

/**
 * Typed stub covering the ExecutionContext surface RolesGuard reads
 * (same harness style as settings.controller.spec.ts).
 */
const createExecutionContext = (
  user: RequestUser | undefined,
  handler: (...args: never[]) => unknown,
  controller: new (...args: never[]) => unknown,
): ExecutionContext => {
  return {
    getHandler: (): unknown => handler,
    getClass: (): unknown => controller,
    switchToHttp: (): {
      getRequest: () => { user?: RequestUser };
    } => ({
      getRequest: (): { user?: RequestUser } => ({ user }),
    }),
  } as ExecutionContext;
};

describe('RolesGuard (T4 / NFR-6)', (): void => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const createUser = (role: StaffRole): RequestUser => ({ role });

  it('allows when user role is in the required StaffRole list', (): void => {
    const allowed = guard.canActivate(
      createExecutionContext(
        createUser('admin'),
        AdminSuperadminHandler.prototype.handle,
        AdminSuperadminHandler,
      ),
    );
    expect(allowed).toBe(true);
    expect(
      reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
        AdminSuperadminHandler.prototype.handle,
        AdminSuperadminHandler,
      ]),
    ).toEqual(['admin', 'superadmin']);
  });

  it('fails closed with forbidden_role when role is missing from ACL', (): void => {
    let caught: HttpException | undefined;
    try {
      guard.canActivate(
        createExecutionContext(
          createUser('agent'),
          AdminOnlyHandler.prototype.handle,
          AdminOnlyHandler,
        ),
      );
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        caught = err;
      }
    }

    expect(caught).toBeInstanceOf(HttpException);
    if (caught instanceof HttpException) {
      expect(caught.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(caught.getResponse()).toEqual({ detail: 'forbidden_role' });
    }
  });

  it('fails closed with forbidden_role when request has no user', (): void => {
    let caught: HttpException | undefined;
    try {
      guard.canActivate(
        createExecutionContext(
          undefined,
          AgentOnlyHandler.prototype.handle,
          AgentOnlyHandler,
        ),
      );
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        caught = err;
      }
    }

    expect(caught).toBeInstanceOf(HttpException);
    if (caught instanceof HttpException) {
      expect(caught.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(caught.getResponse()).toEqual({ detail: 'forbidden_role' });
    }
  });

  it('allows when no roles metadata is set', (): void => {
    expect(
      guard.canActivate(
        createExecutionContext(
          undefined,
          NoRolesHandler.prototype.handle,
          NoRolesHandler,
        ),
      ),
    ).toBe(true);
  });
});
