import {
  PORTAL_CAPTCHA_REQUIRED_SELECTOR_KEYS,
  PORTAL_CAPTCHA_SELECTORS,
  type PortalCaptchaSelectorSet,
} from '../constants';

/**
 * Assert required selector strings are non-empty.
 */
export const assertCaptchaSelectorsReady = (
  selectors: PortalCaptchaSelectorSet = PORTAL_CAPTCHA_SELECTORS,
): void => {
  const missing = PORTAL_CAPTCHA_REQUIRED_SELECTOR_KEYS.filter(
    (key) => selectors[key].trim() === '',
  );
  if (missing.length > 0) {
    throw new Error(`CAPTCHA selectors incomplete: ${missing.join(', ')}`);
  }
};
