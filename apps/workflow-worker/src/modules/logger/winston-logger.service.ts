import { Injectable, type LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Logger as WinstonLogger } from 'winston';
import type { AppEnv } from '../config';
import type { IAppLogger } from './interfaces';
import { createWinstonInstance } from './utils/create-winston-instance.util';

/**
 * Nest LoggerService → Winston bridge.
 * Console + dated level folders under ConfigService LOG_DIR.
 */
@Injectable()
export class WinstonLoggerService implements IAppLogger {
  private readonly winston: WinstonLogger;

  constructor(config: ConfigService<AppEnv, true>) {
    const logDir = config.get('LOG_DIR', { infer: true });
    this.winston = createWinstonInstance({ logDir });
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('info', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug?(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose?(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  fatal?(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  setLogLevels?(levels: LogLevel[]): void {
    // Nest may pass a reduced level list; keep Winston open so Console
    // always mirrors every call that reaches this service.
    void levels;
    this.winston.level = 'silly';
  }

  private write(
    level: 'info' | 'error' | 'warn' | 'debug' | 'verbose',
    message: unknown,
    optionalParams: unknown[],
  ): void {
    const { context, stack } = this.parseOptionalParams(optionalParams);
    const text = this.stringifyMessage(message);
    const meta: { context?: string; stack?: string } = {};
    if (context) {
      meta.context = context;
    }
    if (stack) {
      meta.stack = stack;
    }

    switch (level) {
      case 'error':
        this.winston.error(text, meta);
        break;
      case 'warn':
        this.winston.warn(text, meta);
        break;
      case 'debug':
        this.winston.debug(text, meta);
        break;
      case 'verbose':
        this.winston.verbose(text, meta);
        break;
      default:
        this.winston.info(text, meta);
    }
  }

  private parseOptionalParams(optionalParams: unknown[]): {
    context?: string;
    stack?: string;
  } {
    if (optionalParams.length === 0) {
      return {};
    }

    if (optionalParams.length === 1) {
      const only = optionalParams[0];
      return typeof only === 'string' ? { context: only } : {};
    }

    const [first, second] = optionalParams;
    const context =
      typeof second === 'string'
        ? second
        : typeof first === 'string'
          ? first
          : undefined;
    const stack =
      typeof first === 'string' && typeof second === 'string'
        ? first
        : undefined;
    return { context, stack };
  }

  private stringifyMessage(message: unknown): string {
    if (typeof message === 'string') {
      return message;
    }
    if (message instanceof Error) {
      return message.message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}
