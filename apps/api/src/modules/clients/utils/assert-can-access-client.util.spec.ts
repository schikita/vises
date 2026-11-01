import { HttpException, HttpStatus } from '@nestjs/common';
import { Client } from '../../database/entities/client.entity';
import { User } from '../../database/entities/user.entity';
import { assertCanAccessClient } from './assert-can-access-client.util';

describe('assertCanAccessClient', (): void => {
  const client = Object.assign(new Client(), {
    id: 'cli-1',
    agentId: 'agent-1',
  });

  const agentOwner = Object.assign(new User(), {
    id: 'agent-1',
    role: 'agent' as const,
  });

  const otherAgent = Object.assign(new User(), {
    id: 'agent-2',
    role: 'agent' as const,
  });

  const admin = Object.assign(new User(), {
    id: 'admin-1',
    role: 'admin' as const,
  });

  it('allows owning agent', (): void => {
    expect(assertCanAccessClient(client, agentOwner)).toBe(client);
  });

  it('allows admin', (): void => {
    expect(assertCanAccessClient(client, admin)).toBe(client);
  });

  it('missing → client_not_found', (): void => {
    expect.assertions(2);
    try {
      assertCanAccessClient(null, agentOwner);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    }
  });

  it('cross-tenant agent → forbidden_role', (): void => {
    expect.assertions(3);
    try {
      assertCanAccessClient(client, otherAgent);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });
});
