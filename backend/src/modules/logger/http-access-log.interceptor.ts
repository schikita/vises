import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import {
  HTTP_ACCESS_LOG_CONTEXT,
  HTTP_ACCESS_REQUEST_ID_HEADER,
  HTTP_ACCESS_REQUEST_ID_RESPONSE_HEADER,
} from './constants';
import type { HttpAccessLogRecord } from './types';
import {
  formatHttpAccessLogMessage,
  mapHttpStatusToAccessLogLevel,
  resolveHttpRequestId,
  safeEmitHttpAccessLog,
  summarizeHttpBodyForLog,
} from './utils';
import { WinstonLoggerService } from './winston-logger.service';

/**
 * Global HTTP access logger (DEC-001).
 * Emits exactly one record on Express `response` `finish` with final status;
 * captures success bodies via RxJS `tap`.
 */
@Injectable()
export class HttpAccessLogInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const method = req.method ?? 'GET';
    const originalUrl = req.originalUrl ?? req.url ?? '';

    const startMs = Date.now();
    const requestId = resolveHttpRequestId(
      req.headers[HTTP_ACCESS_REQUEST_ID_HEADER],
    );
    res.setHeader(HTTP_ACCESS_REQUEST_ID_RESPONSE_HEADER, requestId);

    let responseBodyHolder: unknown;
    let emitted = false;

    const onFinish = (): void => {
      if (emitted) {
        return;
      }
      emitted = true;

      try {
        const status = res.statusCode;
        const durationMs = Date.now() - startMs;
        const hasMultipartFile = Boolean(
          (req as Request & { file?: unknown; files?: unknown }).file ||
            (req as Request & { file?: unknown; files?: unknown }).files,
        );
        const requestSummary = summarizeHttpBodyForLog({
          body: req.body,
          contentType: req.headers['content-type'],
          hasMultipartFile,
        });
        const responseSummary = summarizeHttpBodyForLog({
          body: responseBodyHolder,
        });

        const record: HttpAccessLogRecord = {
          method,
          path: originalUrl,
          status,
          durationMs,
          requestId,
        };
        if (requestSummary.value !== undefined) {
          record.requestBody = requestSummary.value;
        }
        if (responseSummary.value !== undefined) {
          record.responseBody = responseSummary.value;
        }

        safeEmitHttpAccessLog({
          logger: this.logger,
          level: mapHttpStatusToAccessLogLevel(status),
          message: formatHttpAccessLogMessage(record),
        });
      } catch (error: unknown) {
        // REQ-012: logging must not alter the completed response — log only.
        const detail =
          error instanceof Error ? error.stack ?? error.message : String(error);
        this.logger.error(
          `HTTP access log failed requestId=${requestId} ${method} ${originalUrl}: ${detail}`,
          HTTP_ACCESS_LOG_CONTEXT,
        );
      }
    };

    res.once('finish', onFinish);
    // DEC-009: abort without `finish` → skip access log (no `close` emit).

    return next.handle().pipe(
      tap({
        next: (data) => {
          responseBodyHolder = data;
        },
      }),
    );
  }
}
