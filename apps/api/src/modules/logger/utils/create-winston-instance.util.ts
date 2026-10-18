import { createLogger, format, transports, type Logger } from 'winston';
import {
  WINSTON_CONSOLE_LOG_LEVEL,
  WINSTON_DEFAULT_LOG_LEVEL,
  WINSTON_ERROR_CHANNEL_LEVELS,
  WINSTON_INFO_CHANNEL_LEVELS,
  WINSTON_LOG_CHANNEL_COMMON,
  WINSTON_LOG_CHANNEL_ERROR,
  WINSTON_LOG_CHANNEL_INFO,
  WINSTON_LOG_CHANNEL_WARN,
  WINSTON_LOG_TIMESTAMP_FORMAT,
  WINSTON_WARN_CHANNEL_LEVELS,
} from '../constants';
import type { CreateWinstonInstanceOptions } from '../types';
import { buildWinstonConsoleLogLineFromInfo } from './build-winston-console-log-line-from-info.util';
import { buildWinstonLogLineFromInfo } from './build-winston-log-line-from-info.util';
import { createWinstonDailyRotateTransport } from './create-winston-daily-rotate-transport.util';
import { createWinstonLevelFilter } from './create-winston-level-filter.util';
import { ensureLogRootDir } from './ensure-log-root-dir.util';
import { resolveWinstonLogDir } from './resolve-winston-log-dir.util';

/**
 * Console (part-colored) + four dated level folders under LOG_DIR:
 * common (all), error/, warn/, info/ → `{channel}/{YYYY-MM}/{YYYY-MM-DD}.log`.
 */
export const createWinstonInstance = (
  options: CreateWinstonInstanceOptions,
): Logger => {
  const logDir = resolveWinstonLogDir(options.logDir);

  ensureLogRootDir(logDir);

  const level = options.level?.trim() || WINSTON_DEFAULT_LOG_LEVEL;

  const nestLikeFormat = format.combine(
    format.timestamp({ format: WINSTON_LOG_TIMESTAMP_FORMAT }),
    format.errors({ stack: true }),
    format.printf((info) => buildWinstonLogLineFromInfo(info)),
  );

  const consoleFormat = format.combine(
    format.timestamp({ format: WINSTON_LOG_TIMESTAMP_FORMAT }),
    format.errors({ stack: true }),
    format.printf((info) => buildWinstonConsoleLogLineFromInfo(info)),
  );

  return createLogger({
    level,
    format: nestLikeFormat,
    transports: [
      new transports.Console({
        level: WINSTON_CONSOLE_LOG_LEVEL,
        format: consoleFormat,
      }),
      createWinstonDailyRotateTransport({
        logDir,
        channel: WINSTON_LOG_CHANNEL_COMMON,
        transportFormat: nestLikeFormat,
      }),
      createWinstonDailyRotateTransport({
        logDir,
        channel: WINSTON_LOG_CHANNEL_ERROR,
        transportFormat: format.combine(
          createWinstonLevelFilter(WINSTON_ERROR_CHANNEL_LEVELS),
          nestLikeFormat,
        ),
      }),
      createWinstonDailyRotateTransport({
        logDir,
        channel: WINSTON_LOG_CHANNEL_WARN,
        transportFormat: format.combine(
          createWinstonLevelFilter(WINSTON_WARN_CHANNEL_LEVELS),
          nestLikeFormat,
        ),
      }),
      createWinstonDailyRotateTransport({
        logDir,
        channel: WINSTON_LOG_CHANNEL_INFO,
        transportFormat: format.combine(
          createWinstonLevelFilter(WINSTON_INFO_CHANNEL_LEVELS),
          nestLikeFormat,
        ),
      }),
    ],
  });
};
