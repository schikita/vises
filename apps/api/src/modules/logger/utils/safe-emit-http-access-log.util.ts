import { HTTP_ACCESS_LOG_CONTEXT } from '../constants';
import type { SafeEmitHttpAccessLogParams } from '../types';

/**
 * Emit an access log via Winston bridge without throwing into the request
 * pipeline (REQ-009–012 / DEC-010).
 */
export const safeEmitHttpAccessLog = (
  params: SafeEmitHttpAccessLogParams,
): void => {
  try {
    const { logger, level, message } = params;
    if (level === 'error') {
      logger.error(message, HTTP_ACCESS_LOG_CONTEXT);
      return;
    }
    if (level === 'warn') {
      logger.warn(message, HTTP_ACCESS_LOG_CONTEXT);
      return;
    }
    logger.log(message, HTTP_ACCESS_LOG_CONTEXT);
  } catch {
    // REQ-012: never replace the original HTTP response due to logging failures.
  }
};
