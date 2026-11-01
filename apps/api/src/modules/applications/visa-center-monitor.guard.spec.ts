import {
  HttpException,
  HttpStatus,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config';
import { VISA_CENTER_MONITOR_API_KEY_HEADER_LOWER } from './constants';
import { VisaCenterMonitorGuard } from './visa-center-monitor.guard';

describe('VisaCenterMonitorGuard (AC-13)', (): void => {
  const createGuard = (expectedKey: string): VisaCenterMonitorGuard => {
    const config = {
      get: jest.fn().mockReturnValue(expectedKey),
    };
    // @ts-expect-error intentional ConfigService unit-test harness
    return new VisaCenterMonitorGuard(config as ConfigService<AppEnv, true>);
  };

  const createContext = (
    headerValue: string | string[] | undefined,
  ): ExecutionContext => {
    const request = {
      headers: {
        [VISA_CENTER_MONITOR_API_KEY_HEADER_LOWER]: headerValue,
      },
    };
    return {
      switchToHttp: (): { getRequest: () => typeof request } => ({
        getRequest: (): typeof request => request,
      }),
    } as ExecutionContext;
  };

  it('allows matching X-Visa-Center-Monitor-Key', (): void => {
    const guard = createGuard('monitor-secret');
    expect(guard.canActivate(createContext('monitor-secret'))).toBe(true);
  });

  it('returns 401 when key is missing', (): void => {
    const guard = createGuard('monitor-secret');
    try {
      guard.canActivate(createContext(undefined));
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    }
  });

  it('returns 401 when key is invalid', (): void => {
    const guard = createGuard('monitor-secret');
    try {
      guard.canActivate(createContext('wrong'));
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    }
  });

  it('returns 401 when env key is empty (fail-closed)', (): void => {
    const guard = createGuard('');
    try {
      guard.canActivate(createContext('anything'));
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    }
  });
});
