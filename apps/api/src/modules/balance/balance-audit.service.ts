import { Inject, Injectable } from '@nestjs/common';
import { APP_LOGGER } from '../logger/constants';
import type { IAppLogger } from '../logger/interfaces';
import { BALANCE_AUDIT_LOG_CONTEXT } from './constants';
import { buildBalanceAdjustAuditPayload } from './utils';

/**
 * Winston audit for manual balance adjustments (FR-4 / NFR-4).
 */
@Injectable()
export class BalanceAuditService {
  constructor(@Inject(APP_LOGGER) private readonly logger: IAppLogger) {}

  logAdjust(params: {
    actorId: string;
    targetAgentId: string;
    amount: string;
    reason: string;
    resultingBalance: string;
  }): void {
    const payload = buildBalanceAdjustAuditPayload(params);
    this.logger.log(JSON.stringify(payload), BALANCE_AUDIT_LOG_CONTEXT);
  }
}
