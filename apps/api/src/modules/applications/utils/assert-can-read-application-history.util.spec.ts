import { HttpException, HttpStatus } from '@nestjs/common';
import { assertCanReadApplicationHistory } from './assert-can-read-application-history.util';

describe('assertCanReadApplicationHistory (T14.2)', (): void => {
  const ownerAgentId = 'agent-1';

  it('allows admin for any owner', (): void => {
    expect((): void => {
      assertCanReadApplicationHistory({
        actorRole: 'admin',
        actorId: 'admin-1',
        ownerAgentId,
      });
    }).not.toThrow();
  });

  it('allows superadmin for any owner', (): void => {
    expect((): void => {
      assertCanReadApplicationHistory({
        actorRole: 'superadmin',
        actorId: 'sa-1',
        ownerAgentId,
      });
    }).not.toThrow();
  });

  it('allows owning agent', (): void => {
    expect((): void => {
      assertCanReadApplicationHistory({
        actorRole: 'agent',
        actorId: ownerAgentId,
        ownerAgentId,
      });
    }).not.toThrow();
  });

  it('rejects non-owning agent with forbidden_role', (): void => {
    try {
      assertCanReadApplicationHistory({
        actorRole: 'agent',
        actorId: 'agent-2',
        ownerAgentId,
      });
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });
});
