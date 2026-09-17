/// <reference lib="dom" />
import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { DetectBlockingPageOptions, PortalPage } from '../types';

export const detectBlockingPage = async (
  page: PortalPage,
  options?: DetectBlockingPageOptions,
): Promise<string | undefined> => {
  const formRoot = PORTAL_REGISTER_USER_SELECTORS.formRoot;
  const clues = await page.evaluate((formRootSel: string) => {
    const bodyText = (document.body?.innerText ?? '').toLowerCase();
    const hasCaptcha =
      Boolean(
        document.querySelector('[class*="captcha" i], [id*="captcha" i]'),
      ) || bodyText.includes('captcha');
    const hasLogin =
      Boolean(
        document.querySelector(
          'input[type="password"], form[action*="Login" i], #loginForm',
        ),
      ) && !document.querySelector(formRootSel);
    return { hasCaptcha, hasLogin };
  }, formRoot);
  if (clues.hasCaptcha && !options?.ignoreCaptchaClues) {
    return 'CAPTCHA / anti-bot challenge detected — stop (CON-007); no bypass attempted';
  }
  if (clues.hasLogin) {
    return 'Auth required: login wall before RegisterUser (OQ-2); credentials not invented';
  }
  return undefined;
};
