import {
  WINSTON_CONSOLE_CONTEXT_STYLES,
  WINSTON_CONSOLE_MESSAGE_STYLES,
  WINSTON_CONSOLE_SEPARATOR_STYLES,
  WINSTON_CONSOLE_TIMESTAMP_STYLES,
} from '../constants';
import type { FormatWinstonLogLineParts } from '../types';
import { applyWinstonConsoleStyle } from './apply-winston-console-style.util';
import { resolveWinstonConsoleLevelStyles } from './resolve-winston-console-level-styles.util';
import { stripAnsiCodes } from './strip-ansi-codes.util';

/**
 * Colorized console record emphasizing time, level, context, and message:
 * `time | LEVEL | context | message`
 */
export const formatWinstonConsoleLogLine = (
  parts: FormatWinstonLogLineParts,
): string => {
  const rawLevel = stripAnsiCodes(parts.level).trim();
  const levelLabel = rawLevel.toUpperCase();
  const contextLabel = parts.context?.trim() ? parts.context.trim() : '-';
  const sep = applyWinstonConsoleStyle(WINSTON_CONSOLE_SEPARATOR_STYLES, ' | ');
  const levelStyles = resolveWinstonConsoleLevelStyles(rawLevel);

  const time = applyWinstonConsoleStyle(
    WINSTON_CONSOLE_TIMESTAMP_STYLES,
    parts.timestamp,
  );
  const level = applyWinstonConsoleStyle(levelStyles, levelLabel);
  const context = applyWinstonConsoleStyle(
    WINSTON_CONSOLE_CONTEXT_STYLES,
    contextLabel,
  );
  const messageStyles =
    rawLevel.toLowerCase() === 'error' || rawLevel.toLowerCase() === 'warn'
      ? levelStyles
      : WINSTON_CONSOLE_MESSAGE_STYLES;
  const message = applyWinstonConsoleStyle(messageStyles, parts.message);

  return `${time}${sep}${level}${sep}${context}${sep}${message}`;
};
