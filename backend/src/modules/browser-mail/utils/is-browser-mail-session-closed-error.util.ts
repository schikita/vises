import { BROWSER_MAIL_SESSION_CLOSED_ERROR } from '../constants';

/**
 * True when an error indicates the headed browser-mail page/browser was closed
 * (DEC-004 / REQ-011). Matches dedicated code and Patchright “has been closed”.
 */
export const isBrowserMailSessionClosedError = (error: unknown): boolean => {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : String(error);
  if (message.includes(BROWSER_MAIL_SESSION_CLOSED_ERROR)) {
    return true;
  }
  return /has been closed/i.test(message);
};
