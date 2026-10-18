import type { LoggerService } from '@nestjs/common';

/** Nest/Winston severity used for access lines (REQ-009). */
export type HttpAccessLogLevel = 'info' | 'warn' | 'error';

/** Fields included in one completed-exchange access record (REQ-002). */
export type HttpAccessLogRecord = {
  method: string;
  /** Path including query string (`originalUrl` as received). */
  path: string;
  status: number;
  durationMs: number;
  requestId: string;
  /** Redacted/truncated summary, omission marker, or absent. */
  requestBody?: string;
  /** Redacted/truncated summary, omission marker, or absent/uncaptured. */
  responseBody?: string;
};

/** Result of truncating a serialized body side (REQ-006). */
export type TruncateLogStringResult = {
  value: string;
  truncated: boolean;
};

/** Result of classifying + summarizing a request/response body. */
export type HttpBodySummaryResult = {
  /**
   * Serialized summary or omission marker.
   * `undefined` when the body is absent/empty and should be omitted from the record.
   */
  value: string | undefined;
  truncated: boolean;
  omitted: boolean;
};

/** Inputs for body summarization (REQ-003 / DEC-002). */
export type SummarizeHttpBodyForLogInput = {
  body: unknown;
  contentType?: string;
  /** True when multer attached `file` / `files` on the request. */
  hasMultipartFile?: boolean;
};

/** Logger surface used by safe emit (REQ-010 / REQ-012). */
export type HttpAccessLogEmitter = Pick<
  LoggerService,
  'log' | 'warn' | 'error'
>;

export type SafeEmitHttpAccessLogParams = {
  logger: HttpAccessLogEmitter;
  level: HttpAccessLogLevel;
  message: string;
};
