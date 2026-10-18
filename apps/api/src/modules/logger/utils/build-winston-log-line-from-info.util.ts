import type { TransformableInfo } from 'logform';
import { formatWinstonLogLine } from './format-winston-log-line.util';

/**
 * Build a plain pipe-separated log line from a Winston info object (file sinks).
 */
export const buildWinstonLogLineFromInfo = (
  info: TransformableInfo,
): string => {
  const context = typeof info.context === 'string' ? info.context : undefined;
  const baseMessage =
    typeof info.message === 'string'
      ? info.message
      : JSON.stringify(info.message);
  const stack =
    typeof info.stack === 'string' && info.stack.length > 0
      ? `\n${info.stack}`
      : '';
  return formatWinstonLogLine({
    timestamp: String(info.timestamp ?? ''),
    level: String(info.level),
    message: `${baseMessage}${stack}`,
    context,
  });
};
