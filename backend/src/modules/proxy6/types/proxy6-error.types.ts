/**
 * Typed Proxy6 client errors (secret-safe Russian-ready messages).
 */

export type Proxy6ApiErrorCode =
  | 'misconfigured'
  | 'auth'
  | 'rate_limited'
  | 'no_money'
  | 'no_stock'
  | 'not_found'
  | 'bad_method'
  | 'request_failed'
  | 'empty_pool'
  | 'all_leased'
  | 'replace_partial';

export type CreateProxy6ApiErrorInput = {
  code: Proxy6ApiErrorCode;
  message: string;
  errorId?: number;
  httpStatus?: number;
};

export type Proxy6ApiError = Error & {
  name: 'Proxy6ApiError';
  code: Proxy6ApiErrorCode;
  errorId?: number;
  httpStatus?: number;
};
