import { HttpException, HttpStatus } from '@nestjs/common';
import { assertCanAssignStaffRole } from './assert-can-assign-staff-role.util';

describe('assertCanAssignStaffRole (T5 / FR-1 / NFR-6)', (): void => {
  it('allows superadmin to assign admin', (): void => {
    expect((): void =>
      assertCanAssignStaffRole({
        actorRole: 'superadmin',
        targetRole: 'admin',
        superadminCount: 1,
      }),
    ).not.toThrow();
  });

  it('allows admin or superadmin to assign agent', (): void => {
    expect((): void =>
      assertCanAssignStaffRole({
        actorRole: 'admin',
        targetRole: 'agent',
        superadminCount: 1,
      }),
    ).not.toThrow();
    expect((): void =>
      assertCanAssignStaffRole({
        actorRole: 'superadmin',
        targetRole: 'agent',
        superadminCount: 1,
      }),
    ).not.toThrow();
  });

  it('forbids admin from assigning admin (forbidden_role)', (): void => {
    try {
      assertCanAssignStaffRole({
        actorRole: 'admin',
        targetRole: 'admin',
        superadminCount: 1,
      });
      fail('expected throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('forbids creating superadmin when none exists (forbidden_role)', (): void => {
    try {
      assertCanAssignStaffRole({
        actorRole: 'superadmin',
        targetRole: 'superadmin',
        superadminCount: 0,
      });
      fail('expected throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('rejects second superadmin with superadmin_exists', (): void => {
    try {
      assertCanAssignStaffRole({
        actorRole: 'superadmin',
        targetRole: 'superadmin',
        superadminCount: 1,
      });
      fail('expected throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toEqual({ detail: 'superadmin_exists' });
      }
    }
  });

  it('allows keeping an existing superadmin role unchanged', (): void => {
    expect((): void =>
      assertCanAssignStaffRole({
        actorRole: 'superadmin',
        targetRole: 'superadmin',
        superadminCount: 1,
        currentRole: 'superadmin',
      }),
    ).not.toThrow();
  });
});
