import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { APP_LOGGER } from './constants';
import { HttpAccessLogInterceptor } from './http-access-log.interceptor';
import { WinstonLoggerService } from './winston-logger.service';

/**
 * Global Winston-backed Nest logger (DEC-001 / DEC-002).
 * Registers HTTP access logging via APP_INTERCEPTOR (DEC-003).
 * Register after AppConfigModule so ConfigService has LOG_DIR.
 */
@Global()
@Module({
  providers: [
    WinstonLoggerService,
    { provide: APP_LOGGER, useExisting: WinstonLoggerService },
    { provide: APP_INTERCEPTOR, useClass: HttpAccessLogInterceptor },
  ],
  exports: [WinstonLoggerService, APP_LOGGER],
})
export class LoggerModule {}
