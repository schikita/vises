import type { TransformableInfo } from 'logform';
import { formatWinstonConsoleLogLine } from './format-winston-console-log-line.util';

/**
 * Build a colorized console log line from a Winston info object.
 */
export const buildWinstonConsoleLogLineFromInfo = (
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
  return formatWinstonConsoleLogLine({
    timestamp: String(info.timestamp ?? ''),
    level: String(info.level),
    message: `${baseMessage}${stack}`,
    context,
  });
};
