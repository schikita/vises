import { HttpException, HttpStatus } from '@nestjs/common';
import { assertMonitorStatusRemapAllowed } from './assert-monitor-status-remap-allowed.util';

describe('assertMonitorStatusRemapAllowed (FR-13 / ASAU-003)', (): void => {
  it('allows draft → not_ready_for_appointment', (): void => {
    expect((): void => {
      assertMonitorStatusRemapAllowed({ source: 'draft' });
    }).not.toThrow();
  });

  it('allows filling → not_ready_for_appointment', (): void => {
    expect((): void => {
      assertMonitorStatusRemapAllowed({ source: 'filling' });
    }).not.toThrow();
  });

  it('rejects other sources with illegal_transition', (): void => {
    for (const source of [
      'not_ready_for_appointment',
      'ready_for_appointment',
      'booked',
      'declined',
    ] as const) {
      try {
        assertMonitorStatusRemapAllowed({ source });
        fail(`expected throw for ${source}`);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(error.getResponse()).toEqual({ detail: 'illegal_transition' });
        }
      }
    }
  });
});
