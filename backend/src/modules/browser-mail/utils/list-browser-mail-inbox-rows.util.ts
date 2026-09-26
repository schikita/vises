import { BROWSER_MAIL_SELECTOR } from '../constants';
import type {
  BrowserMailInboxRow,
  BrowserMailInboxRowDomAttrs,
  BrowserMailPage,
} from '../types';
import { deriveBrowserMailRowId } from './derive-browser-mail-row-id.util';

/**
 * Snapshot `div.inbox` → `div.mail` rows without opening letters (REQ-004 / DEC-001).
 * Empty inbox → empty array (valid baseline).
 */
export const listBrowserMailInboxRows = async (
  page: BrowserMailPage,
): Promise<BrowserMailInboxRow[]> => {
  const raw = await page.evaluate(
    (mailRowSelector: string): BrowserMailInboxRowDomAttrs[] => {
      const nodes = Array.from(document.querySelectorAll(mailRowSelector));
      return nodes.map((el, index) => {
        const anchor = el.querySelector('a');
        return {
          index,
          onclick: el.getAttribute('onclick') ?? '',
          href:
            el.getAttribute('href') ??
            anchor?.getAttribute('href') ??
            '',
          rowText: (el.textContent ?? '').trim(),
        };
      });
    },
    BROWSER_MAIL_SELECTOR.MAIL_ROW,
  );

  return raw.map((item) => {
    const rowId = deriveBrowserMailRowId({
      onclick: item.onclick,
      href: item.href,
      rowText: item.rowText,
    });
    const preview = item.rowText.slice(0, 80);
    return {
      rowId,
      index: item.index,
      ...(preview.length > 0 ? { subjectPreview: preview } : {}),
    };
  });
};
