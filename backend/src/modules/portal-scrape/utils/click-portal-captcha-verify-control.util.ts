/// <reference lib="dom" />
import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

/** Click RegisterUser `#btnVerify` once (pipeline initial + DEC-002 adaptive). */
export const clickPortalCaptchaVerifyControl = async (
  page: PortalPage,
): Promise<void> => {
  const verifyControl = PORTAL_REGISTER_USER_SELECTORS.verifyControl;
  const result = await page.evaluate((verifySel: string) => {
    const btn = document.querySelector(verifySel) as HTMLButtonElement | null;
    if (!btn) {
      return { ok: false as const };
    }
    btn.click();
    return { ok: true as const };
  }, verifyControl);

  if (!result.ok) {
    throw new Error(`${verifyControl} not found for captcha Verify click`);
  }
};
