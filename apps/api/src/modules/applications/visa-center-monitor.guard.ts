import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config';
import {
  VISA_CENTER_MONITOR_API_KEY_ENV,
  VISA_CENTER_MONITOR_API_KEY_HEADER_LOWER,
} from './constants';
import {
  throwMonitorUnauthorized,
  timingSafeEqualString,
} from './utils';

/**
 * Static API-key gate for the monitor-only drafting→pending endpoint (AC-13).
 * Header: `X-Visa-Center-Monitor-Key` (see env examples). Missing/invalid → 401.
 */
@Injectable()
export class VisaCenterMonitorGuard implements CanActivate {
  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();

    const rawHeader = request.headers[VISA_CENTER_MONITOR_API_KEY_HEADER_LOWER];
    const provided = Array.isArray(rawHeader)
      ? (rawHeader[0] ?? '').trim()
      : (rawHeader ?? '').trim();

    const expected = this.config
      .get(VISA_CENTER_MONITOR_API_KEY_ENV, { infer: true })
      .trim();

    if (!expected || !provided || !timingSafeEqualString(provided, expected)) {
      return throwMonitorUnauthorized();
    }

    return true;
  }
}
