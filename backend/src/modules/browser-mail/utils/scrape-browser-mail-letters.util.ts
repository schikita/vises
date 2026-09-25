import { createHash } from 'crypto';
import type { BrowserMailLetter, BrowserMailPage } from '../types';

/**
 * Scrape opened letter bodies from tempmail.plus inbox UI (REQ-010).
 * Returns letters with non-empty bodies; messageId is a stable content hash.
 */
export const scrapeBrowserMailLetters = async (
  page: BrowserMailPage,
): Promise<BrowserMailLetter[]> => {
  const raw = await page.evaluate(() => {
    const letters = Array.from(
      document.querySelectorAll('#container-body .letter'),
    );
    return letters.map((letter, index) => {
      const bodyEl =
        letter.querySelector('#info .overflow-auto') ??
        letter.querySelector('.overflow-auto') ??
        letter;
      const subjectEl = letter.querySelector('#info .subject') ??
        letter.querySelector('.subject');
      const body = (bodyEl?.textContent ?? '').trim();
      const subject = (subjectEl?.textContent ?? '').trim();
      return { index, subject, body };
    });
  });

  return raw
    .filter((item) => item.body.length > 0)
    .map((item) => {
      const messageId = createHash('sha256')
        .update(`${item.subject}\n${item.body}\n${item.index}`)
        .digest('hex')
        .slice(0, 24);
      return { messageId, body: item.body };
    });
};
