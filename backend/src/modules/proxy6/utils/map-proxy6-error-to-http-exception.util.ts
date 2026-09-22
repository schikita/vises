import { HttpException, HttpStatus } from '@nestjs/common';
import { isProxy6ApiError } from './is-proxy6-api-error.util';
import { PROXY6_MSG_REQUEST_FAILED } from '../constants';

/**
 * Map Proxy6 typed errors to Nest HTTP exceptions with Russian safe details
 * (REQ-019 / NFR-003). Never includes API key or proxy passwords.
 */
export const mapProxy6ErrorToHttpException = (err: unknown): HttpException => {
  if (err instanceof HttpException) return err;
  if (isProxy6ApiError(err)) {
    const status =
      err.code === 'misconfigured' || err.code === 'auth'
        ? HttpStatus.BAD_REQUEST
        : err.code === 'no_money' || err.code === 'no_stock'
          ? HttpStatus.PAYMENT_REQUIRED
          : err.code === 'not_found'
            ? HttpStatus.NOT_FOUND
            : err.code === 'replace_partial'
              ? HttpStatus.CONFLICT
              : err.code === 'rate_limited'
                ? HttpStatus.TOO_MANY_REQUESTS
                : HttpStatus.BAD_GATEWAY;
    return new HttpException(
      err.message.trim().length > 0 ? err.message : PROXY6_MSG_REQUEST_FAILED,
      status,
    );
  }
  const message =
    err instanceof Error && err.message.trim().length > 0
      ? err.message
      : PROXY6_MSG_REQUEST_FAILED;
  return new HttpException(message, HttpStatus.BAD_GATEWAY);
};
