import { HttpException, HttpStatus } from '@nestjs/common';
import { assertCanReadLedger } from './assert-can-read-ledger.util';

describe('assertCanReadLedger (§6.4)', (): void => {
  it('allows admin and superadmin for any agent', (): void => {
    expect((): void => {
      assertCanReadLedger({
        actorRole: 'admin',
        actorId: 'admin-1',
        agentId: 'agent-2',
      });
    }).not.toThrow();
    expect((): void => {
      assertCanReadLedger({
        actorRole: 'superadmin',
        actorId: 'sa-1',
        agentId: 'agent-2',
      });
    }).not.toThrow();
  });

  it('allows agent to read own ledger', (): void => {
    expect((): void => {
      assertCanReadLedger({
        actorRole: 'agent',
        actorId: 'agent-1',
        agentId: 'agent-1',
      });
    }).not.toThrow();
  });

  it('forbids agent reading another agent ledger', (): void => {
    expect.assertions(3);
    try {
      assertCanReadLedger({
        actorRole: 'agent',
        actorId: 'agent-1',
        agentId: 'agent-2',
      });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });
});
