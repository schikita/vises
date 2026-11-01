import { HttpException, HttpStatus } from '@nestjs/common';
import { assertCanMutateUser } from './assert-can-mutate-user.util';

describe('assertCanMutateUser (T5 / AC-2 / FR-1.4)', (): void => {
  it('allows superadmin to mutate admin, agent, and superadmin', (): void => {
    expect((): void =>
      assertCanMutateUser({ actorRole: 'superadmin', targetRole: 'admin' }),
    ).not.toThrow();
    expect((): void =>
      assertCanMutateUser({ actorRole: 'superadmin', targetRole: 'agent' }),
    ).not.toThrow();
    expect((): void =>
      assertCanMutateUser({
        actorRole: 'superadmin',
        targetRole: 'superadmin',
      }),
    ).not.toThrow();
  });

  it('allows admin to mutate agent only', (): void => {
    expect((): void =>
      assertCanMutateUser({ actorRole: 'admin', targetRole: 'agent' }),
    ).not.toThrow();
  });

  it('forbids admin from mutating admin or superadmin', (): void => {
    for (const targetRole of ['admin', 'superadmin'] as const) {
      try {
        assertCanMutateUser({ actorRole: 'admin', targetRole });
        fail(`expected throw for ${targetRole}`);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
          expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
        }
      }
    }
  });

  it('forbids agent from mutating anyone', (): void => {
    try {
      assertCanMutateUser({ actorRole: 'agent', targetRole: 'agent' });
      fail('expected throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });
});
