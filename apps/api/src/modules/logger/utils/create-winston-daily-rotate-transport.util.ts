import { join } from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import {
  WINSTON_LOG_DATE_PATTERN,
  WINSTON_LOG_FILENAME_TEMPLATE,
} from '../constants';
import type { CreateWinstonDailyRotateTransportOptions } from '../types';

/**
 * Daily-rotating file transport under `{LOG_DIR}/{channel}/{YYYY-MM}/{YYYY-MM-DD}.log`.
 */
export const createWinstonDailyRotateTransport = (
  options: CreateWinstonDailyRotateTransportOptions,
): DailyRotateFile => {
  const dirname = join(options.logDir, options.channel);
  const auditFile = join(options.logDir, '.audit', `${options.channel}-audit.json`);

  return new DailyRotateFile({
    dirname,
    filename: WINSTON_LOG_FILENAME_TEMPLATE,
    datePattern: WINSTON_LOG_DATE_PATTERN,
    auditFile,
    createSymlink: false,
    format: options.transportFormat,
  });
};
