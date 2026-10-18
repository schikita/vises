import type { Format } from 'logform';

export type CreateWinstonInstanceOptions = {
  /** Root directory for level folders (`LOG_DIR`). */
  logDir: string;
  level?: string;
};

export type FormatWinstonLogLineParts = {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
};

/**
 * Single Node `util.styleText` format token used in console log styling.
 * Kept as a string union of the styles we actually apply.
 */
export type WinstonConsoleStyle =
  | 'bold'
  | 'dim'
  | 'gray'
  | 'cyan'
  | 'cyanBright'
  | 'magentaBright'
  | 'whiteBright'
  | 'redBright'
  | 'yellowBright'
  | 'greenBright'
  | 'green'
  | 'blue'
  | 'blueBright'
  | 'white';

export type WinstonLogChannel = 'common' | 'error' | 'warn' | 'info';

export type CreateWinstonDailyRotateTransportOptions = {
  logDir: string;
  channel: WinstonLogChannel;
  /** Winston format for this transport (optional level filter + line format). */
  transportFormat: Format;
};
