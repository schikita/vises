import type { Proxy6ApiErrorCode } from '../types';
import {
  PROXY6_MSG_AUTH,
  PROXY6_MSG_BAD_METHOD,
  PROXY6_MSG_NO_MONEY,
  PROXY6_MSG_NO_STOCK,
  PROXY6_MSG_NOT_FOUND,
  PROXY6_MSG_REQUEST_FAILED,
} from '../constants';

/** Map Proxy6 `error_id` to typed code + Russian-ready operator message. */
export const mapProxy6ErrorId = (
  errorId: number | undefined,
): { code: Proxy6ApiErrorCode; message: string } => {
  switch (errorId) {
    case 100:
    case 105:
      return { code: 'auth', message: PROXY6_MSG_AUTH };
    case 110:
      return { code: 'bad_method', message: PROXY6_MSG_BAD_METHOD };
    case 300:
      return { code: 'no_stock', message: PROXY6_MSG_NO_STOCK };
    case 400:
      return { code: 'no_money', message: PROXY6_MSG_NO_MONEY };
    case 404:
      return { code: 'not_found', message: PROXY6_MSG_NOT_FOUND };
    default:
      return { code: 'request_failed', message: PROXY6_MSG_REQUEST_FAILED };
  }
};
