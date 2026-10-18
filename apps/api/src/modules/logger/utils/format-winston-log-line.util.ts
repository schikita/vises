import type { FormatWinstonLogLineParts } from '../types';

/**
 * Structured pipe-separated log record (plain text for files):
 * `YYYY-MM-DD HH:mm:ss.SSS | LEVEL | context | message`
 */
export const formatWinstonLogLine = (
  parts: FormatWinstonLogLineParts,
): string => {
  const level = parts.level.toUpperCase();
  const context = parts.context?.trim() ? parts.context.trim() : '-';
  return `${parts.timestamp} | ${level} | ${context} | ${parts.message}`;
};
