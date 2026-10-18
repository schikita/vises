import {
  WINSTON_CONSOLE_LEVEL_FALLBACK_STYLES,
  WINSTON_CONSOLE_LEVEL_STYLES,
} from '../constants';
import type { WinstonConsoleStyle } from '../types';
import { stripAnsiCodes } from './strip-ansi-codes.util';

/** Resolve console styles for a Winston level name (case-insensitive). */
export const resolveWinstonConsoleLevelStyles = (
  level: string,
): readonly WinstonConsoleStyle[] => {
  const key = stripAnsiCodes(level).trim().toLowerCase();
  const mapped =
    WINSTON_CONSOLE_LEVEL_STYLES[
      key as keyof typeof WINSTON_CONSOLE_LEVEL_STYLES
    ];
  return mapped ?? WINSTON_CONSOLE_LEVEL_FALLBACK_STYLES;
};
