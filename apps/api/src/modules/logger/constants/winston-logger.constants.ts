/**
 * Default Winston logger level (NFR-001).
 * `silly` so Console (and channel filters) can receive every Nest level.
 */
export const WINSTON_DEFAULT_LOG_LEVEL = 'silly';

/** Console transport always mirrors every level. */
export const WINSTON_CONSOLE_LOG_LEVEL = 'silly';

/** Level folder names under `LOG_DIR`. */
export const WINSTON_LOG_CHANNEL_COMMON = 'common';
export const WINSTON_LOG_CHANNEL_ERROR = 'error';
export const WINSTON_LOG_CHANNEL_WARN = 'warn';
export const WINSTON_LOG_CHANNEL_INFO = 'info';

export const WINSTON_LOG_CHANNELS = [
  WINSTON_LOG_CHANNEL_COMMON,
  WINSTON_LOG_CHANNEL_ERROR,
  WINSTON_LOG_CHANNEL_WARN,
  WINSTON_LOG_CHANNEL_INFO,
] as const;

/** Levels written only under the `error/` folder. */
export const WINSTON_ERROR_CHANNEL_LEVELS = ['error'] as const;

/** Levels written only under the `warn/` folder. */
export const WINSTON_WARN_CHANNEL_LEVELS = ['warn'] as const;

/**
 * Levels written under the `info/` folder (non-error / non-warn).
 * Includes Nest-mapped Winston levels (info/debug/verbose/…).
 */
export const WINSTON_INFO_CHANNEL_LEVELS = [
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
] as const;

/**
 * Month folder + daily file via `%DATE%` (file-stream-rotator creates dirs).
 * Example: `error/2026-09/2026-09-19.log`
 */
export const WINSTON_LOG_DATE_PATTERN = 'YYYY-MM/YYYY-MM-DD';

/** Daily file name template (`%DATE%` → datePattern). */
export const WINSTON_LOG_FILENAME_TEMPLATE = '%DATE%.log';

/** Timestamp format embedded in each log record. */
export const WINSTON_LOG_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

/** Console: bright cyan timestamp (emphasized time column). */
export const WINSTON_CONSOLE_TIMESTAMP_STYLES = ['bold', 'cyanBright'] as const;

/** Console: bright separators between columns. */
export const WINSTON_CONSOLE_SEPARATOR_STYLES = ['bold', 'whiteBright'] as const;

/** Console: bold magenta Nest context (main structural part). */
export const WINSTON_CONSOLE_CONTEXT_STYLES = ['bold', 'magentaBright'] as const;

/** Console: bright white message body (main content). */
export const WINSTON_CONSOLE_MESSAGE_STYLES = ['whiteBright'] as const;

/** Console: bold level colors by Winston level name. */
export const WINSTON_CONSOLE_LEVEL_STYLES = {
  error: ['bold', 'redBright'],
  warn: ['bold', 'yellowBright'],
  info: ['bold', 'greenBright'],
  http: ['bold', 'green'],
  verbose: ['bold', 'blue'],
  debug: ['bold', 'blueBright'],
  silly: ['bold', 'gray'],
} as const;

/** Fallback when level is unknown. */
export const WINSTON_CONSOLE_LEVEL_FALLBACK_STYLES = ['bold', 'white'] as const;
