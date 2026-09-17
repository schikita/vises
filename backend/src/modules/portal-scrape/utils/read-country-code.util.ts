/// <reference lib="dom" />
import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

export const readCountryCode = async (
  page: PortalPage,
): Promise<string | undefined> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields.CountryCode;
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel) as HTMLInputElement | null;
    return el?.value;
  }, selector);
};
