import { HttpException, HttpStatus } from '@nestjs/common';
import { assertNonEmptyReason } from './assert-non-empty-reason.util';

describe('assertNonEmptyReason (FR-4 / edge 15)', (): void => {
  it('returns trimmed reason', (): void => {
    expect(assertNonEmptyReason('  penalty  ')).toBe('penalty');
  });

  it('rejects whitespace-only reason with reason_required', (): void => {
    expect.assertions(3);
    try {
      assertNonEmptyReason('   ');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({ detail: 'reason_required' });
      }
    }
  });

  it('rejects empty reason with reason_required', (): void => {
    expect.assertions(2);
    try {
      assertNonEmptyReason('');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'reason_required' });
      }
    }
  });
});
