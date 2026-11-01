import { HttpException, HttpStatus } from '@nestjs/common';
import { APPLICATION_STATUS_TRANSITION_MATRIX } from '@vises/contracts';
import { assertStatusTransitionAllowed } from './assert-status-transition-allowed.util';

describe('assertStatusTransitionAllowed (AC-12 / AC-14 / FR-7.4)', (): void => {
  it('allows every matrix row for each listed actor', (): void => {
    for (const row of APPLICATION_STATUS_TRANSITION_MATRIX) {
      for (const actor of row.actors) {
        expect((): void => {
          assertStatusTransitionAllowed({
            source: row.source,
            target: row.target,
            actor,
            isOwningAgent: actor === 'agent',
          });
        }).not.toThrow();
      }
    }
  });

  it('rejects unknown source→target with illegal_transition', (): void => {
    try {
      assertStatusTransitionAllowed({
        source: 'drafting',
        target: 'issued',
        actor: 'admin',
        isOwningAgent: false,
      });
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({ detail: 'illegal_transition' });
      }
    }
  });

  it('rejects staff on drafting→pending (monitor-only)', (): void => {
    try {
      assertStatusTransitionAllowed({
        source: 'drafting',
        target: 'pending',
        actor: 'admin',
        isOwningAgent: false,
      });
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'illegal_transition' });
      }
    }
  });

  it('rejects non-owning agent with forbidden_role', (): void => {
    try {
      assertStatusTransitionAllowed({
        source: 'pending',
        target: 'booked',
        actor: 'agent',
        isOwningAgent: false,
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

  it('allows booked→pending and rejected→pending for staff (AC-14)', (): void => {
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'booked',
        target: 'pending',
        actor: 'admin',
        isOwningAgent: false,
      });
    }).not.toThrow();
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'rejected',
        target: 'pending',
        actor: 'superadmin',
        isOwningAgent: false,
      });
    }).not.toThrow();
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'booked',
        target: 'pending',
        actor: 'agent',
        isOwningAgent: true,
      });
    }).not.toThrow();
  });

  it('allows monitor only for drafting→pending (AC-13)', (): void => {
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'drafting',
        target: 'pending',
        actor: 'visa_center_monitor',
        isOwningAgent: false,
      });
    }).not.toThrow();
    try {
      assertStatusTransitionAllowed({
        source: 'pending',
        target: 'booked',
        actor: 'visa_center_monitor',
        isOwningAgent: false,
      });
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'illegal_transition' });
      }
    }
  });
});
