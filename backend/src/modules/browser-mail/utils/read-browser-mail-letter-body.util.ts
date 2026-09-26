import {
  BROWSER_MAIL_NAV_TIMEOUT_MS,
  BROWSER_MAIL_SELECTOR,
  BROWSER_MAIL_SESSION_CLOSED_ERROR,
  BROWSER_MAIL_UI_PACE_MS,
} from '../constants';
import type { BrowserMailPage } from '../types';
import { browserMailSleep } from './browser-mail-sleep.util';
import { isBrowserMailSessionClosedError } from './is-browser-mail-session-closed-error.util';

/**
 * Read opened letter body via `#info` last-child → overflow cascade (DEC-002).
 * Returns trimmed text or empty — empty is not success at the adapter layer.
 * Does not log body (NFR-001). Paces ~1 s after read (REQ-008).
 */
export const readBrowserMailLetterBody = async (
  page: BrowserMailPage,
): Promise<string> => {
  try {
    await page.waitForSelector(BROWSER_MAIL_SELECTOR.LETTER, {
      state: 'visible',
      timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
    });

    const body = await page.evaluate(
      (selectors: {
        letter: string;
        info: string;
        infoOverflow: string;
      }): string => {
        const info = document.querySelector(selectors.info);
        if (info) {
          const fromLast = (info.lastElementChild?.textContent ?? '').trim();
          if (fromLast.length > 0) {
            return fromLast;
          }
        }

        const infoOverflow = document.querySelector(selectors.infoOverflow);
        const fromInfoOverflow = (infoOverflow?.textContent ?? '').trim();
        if (fromInfoOverflow.length > 0) {
          return fromInfoOverflow;
        }

        const letter = document.querySelector(selectors.letter);
        const letterOverflow = letter?.querySelector('.overflow-auto');
        return (letterOverflow?.textContent ?? '').trim();
      },
      {
        letter: BROWSER_MAIL_SELECTOR.LETTER,
        info: BROWSER_MAIL_SELECTOR.LETTER_INFO,
        infoOverflow: BROWSER_MAIL_SELECTOR.LETTER_INFO_OVERFLOW,
      },
    );

    await browserMailSleep(BROWSER_MAIL_UI_PACE_MS);
    return body;
  } catch (err) {
    if (isBrowserMailSessionClosedError(err)) {
      throw new Error(BROWSER_MAIL_SESSION_CLOSED_ERROR);
    }
    throw err;
  }
};
