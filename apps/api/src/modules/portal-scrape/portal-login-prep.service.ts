import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import type { PortalLoginPrepHttpOutcome } from './types';
import { formatPortalLogContext } from './utils';

/**
 * Staff HTTP portal login preparation.
 * API process rejects browser work (REQ-011 / DEC-006) — execution moves to
 * @vises/workflow-worker (RabbitMQ enqueue lands in later tasks).
 */
@Injectable()
export class PortalLoginPrepService {
  private readonly logger = new Logger(PortalLoginPrepService.name);

  /**
   * POST /api/apps/:applicationId/portal-login-prep (admin|manager).
   * Never launches Patchright on the API process.
   */
  async runForHttp(applicationId: string): Promise<PortalLoginPrepHttpOutcome> {
    const logPrefix = formatPortalLogContext({
      applicationId,
      applicantId: 'login-prep',
    });
    this.logger.warn(
      `${logPrefix} login-prep rejected on API — browser execution is worker-only`,
    );
    throw new HttpException(
      {
        detail:
          'Подготовка логина выполняется worker-процессом. HTTP browser path на API отключён.',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
