import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';
import type { UpsertAppDto } from '../dto/upsert-app.dto';
import { assertAgentCannotWritePayment } from './assert-agent-cannot-write-payment.util';

const userWithRole = (role: string): User =>
  Object.assign(new User(), {
    id: 'u-1',
    name: 'U',
    login: 'u1',
    email: 'u@example.com',
    passwordHash: 'x',
    invitePassword: '',
    role,
    balance: null,
    active: true,
    inviteToken: 'tok',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('assertAgentCannotWritePayment (ASAU-TASK-004 / OQ-ASAU-003)', (): void => {
  it('rejects agent when paymentPaid is present', (): void => {
    const body: UpsertAppDto = { paymentPaid: true };
    expect.assertions(3);
    try {
      assertAgentCannotWritePayment(userWithRole('agent'), body);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('rejects agent when paymentAmount is present', (): void => {
    const body: UpsertAppDto = { paymentAmount: 200 };
    expect.assertions(2);
    try {
      assertAgentCannotWritePayment(userWithRole('agent'), body);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('rejects agent when paymentNote is present', (): void => {
    const body: UpsertAppDto = { paymentNote: 'paid cash' };
    expect.assertions(2);
    try {
      assertAgentCannotWritePayment(userWithRole('agent'), body);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('allows agent when payment fields are omitted', (): void => {
    expect((): void => {
      assertAgentCannotWritePayment(userWithRole('agent'), {
        destination: 'ES',
      });
    }).not.toThrow();
  });

  it('allows admin to write payment fields', (): void => {
    expect((): void => {
      assertAgentCannotWritePayment(userWithRole('admin'), {
        paymentPaid: true,
        paymentAmount: 200,
        paymentNote: 'ok',
      });
    }).not.toThrow();
  });

  it('allows superadmin to write payment fields', (): void => {
    expect((): void => {
      assertAgentCannotWritePayment(userWithRole('superadmin'), {
        paymentPaid: true,
      });
    }).not.toThrow();
  });
});
