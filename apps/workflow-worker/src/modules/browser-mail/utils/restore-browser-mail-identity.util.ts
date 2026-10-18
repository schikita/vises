import {
  BROWSER_MAIL_NAV_TIMEOUT_MS,
  BROWSER_MAIL_SELECTOR,
} from '../constants';
import type { BrowserMailPage } from '../types';
import { parseBrowserMailAddress } from './parse-browser-mail-address.util';
import { waitBrowserMailInboxVisible } from './wait-browser-mail-inbox-visible.util';

/**
 * Restore local-part + matching domain on a live tempmail.plus page without
 * reload (REQ-002 / REQ-010 / DEC-003).
 */
export const restoreBrowserMailIdentity = async (
  page: BrowserMailPage,
  address: string,
): Promise<void> => {
  const parsed = parseBrowserMailAddress(address);
  if (!parsed) {
    throw new Error('browser_mail_identity_address_invalid');
  }

  await page.waitForSelector(BROWSER_MAIL_SELECTOR.PRE_BUTTON, {
    state: 'visible',
    timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
  });

  await page.locator(BROWSER_MAIL_SELECTOR.PRE_BUTTON).fill(parsed.localPart);

  await page.locator(BROWSER_MAIL_SELECTOR.DOMAIN).click();
  await page.waitForSelector(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS, {
    state: 'visible',
    timeout: BROWSER_MAIL_NAV_TIMEOUT_MS,
  });

  const itemCount = await page
    .locator(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS)
    .count();
  let pickIndex = -1;
  for (let i = 0; i < itemCount; i += 1) {
    const text = await page
      .locator(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS)
      .nth(i)
      .textContent();
    const label = (text ?? '').trim().replace(/^@/, '').toLowerCase();
    if (label === parsed.domain) {
      pickIndex = i;
      break;
    }
  }
  if (pickIndex < 0) {
    throw new Error('browser_mail_identity_domain_missing');
  }

  await page
    .locator(BROWSER_MAIL_SELECTOR.DOMAIN_DROPDOWN_ITEMS)
    .nth(pickIndex)
    .click();

  await waitBrowserMailInboxVisible(page);
};
