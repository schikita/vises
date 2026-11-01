import { Inject, Injectable } from '@nestjs/common';
import { APP_LOGGER } from '../logger/constants';
import type { IAppLogger } from '../logger/interfaces';
import { PII_AUDIT_LOG_CONTEXT } from './constants';
import type { PiiReadAuditContext } from './types';
import { buildPiiReadAuditPayload } from './utils';

/**
 * Winston audit for operational passport PII reads (FR-6 / AC-10).
 * Logs ciphertext prefix only — never plaintext or full ciphertext.
 */
@Injectable()
export class PiiAuditService {
  constructor(@Inject(APP_LOGGER) private readonly logger: IAppLogger) {}

  logPassportRead(
    context: PiiReadAuditContext,
    packedCiphertext: string,
  ): void {
    const payload = buildPiiReadAuditPayload(context, packedCiphertext);
    this.logger.log(JSON.stringify(payload), PII_AUDIT_LOG_CONTEXT);
  }
}
