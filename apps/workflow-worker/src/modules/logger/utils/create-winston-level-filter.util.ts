import { format } from 'winston';

/**
 * Winston format that keeps only the given levels (drops all others).
 */
export const createWinstonLevelFilter = (levels: readonly string[]) =>
  format((info) => (levels.includes(info.level) ? info : false))();
