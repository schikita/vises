/// <reference lib="dom" />
import { PORTAL_LOGIN_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

/** Click login `#btnVerify` once when captcha-service path is armed (DEC-012). */
export const clickPortalLoginVerifyControl = async (
  page: PortalPage,
): Promise<void> => {
  const verifyControl = PORTAL_LOGIN_SELECTORS.verifyControl;
  const result = await page.evaluate((verifySel: string) => {
    const btn = document.querySelector(verifySel) as HTMLButtonElement | null;
    if (!btn) {
      return { ok: false as const };
    }
    btn.click();
    return { ok: true as const };
  }, verifyControl);

  if (!result.ok) {
    throw new Error(`${verifyControl} not found for login Verify click`);
  }
};
