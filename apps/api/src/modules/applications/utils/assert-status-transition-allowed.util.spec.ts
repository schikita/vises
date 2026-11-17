import { HttpException, HttpStatus } from '@nestjs/common';
import { APPLICATION_STATUS_TRANSITION_MATRIX } from '@vises/contracts';
import { assertStatusTransitionAllowed } from './assert-status-transition-allowed.util';

describe('assertStatusTransitionAllowed (§4.C / FR-13 / ASAU-003)', (): void => {
  it('allows every matrix row for each listed actor including system', (): void => {
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
        source: 'draft',
        target: 'booked',
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

  it('rejects non-owning agent with forbidden_role', (): void => {
    try {
      assertStatusTransitionAllowed({
        source: 'ready_for_appointment',
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

  it('allows booked→ready and declined→not_ready for staff', (): void => {
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'booked',
        target: 'ready_for_appointment',
        actor: 'admin',
        isOwningAgent: false,
      });
    }).not.toThrow();
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'declined',
        target: 'not_ready_for_appointment',
        actor: 'superadmin',
        isOwningAgent: false,
      });
    }).not.toThrow();
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'booked',
        target: 'ready_for_appointment',
        actor: 'agent',
        isOwningAgent: true,
      });
    }).not.toThrow();
  });

  it('allows monitor only on draft→not_ready_for_appointment', (): void => {
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'draft',
        target: 'not_ready_for_appointment',
        actor: 'visa_center_monitor',
        isOwningAgent: false,
      });
    }).not.toThrow();
    try {
      assertStatusTransitionAllowed({
        source: 'filling',
        target: 'not_ready_for_appointment',
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

  it('allows system where matrix lists it (draft→filling)', (): void => {
    expect((): void => {
      assertStatusTransitionAllowed({
        source: 'draft',
        target: 'filling',
        actor: 'system',
        isOwningAgent: false,
      });
    }).not.toThrow();
    try {
      assertStatusTransitionAllowed({
        source: 'filling',
        target: 'draft',
        actor: 'system',
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
