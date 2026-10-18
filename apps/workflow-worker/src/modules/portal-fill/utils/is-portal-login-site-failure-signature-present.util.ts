import type {
  PortalLoginSiteFailureSignatureResult,
  PortalPage,
} from '../types';
import { detectPortalLoginSiteProcessingAlert } from './detect-portal-login-site-processing-alert.util';
import { discoverLoginPasswordControl } from './discover-login-password-control.util';
import { isPortalLoginCaptchaBlockPresent } from './is-portal-login-captcha-block-present.util';

/**
 * Compose REQ-002 three-way signature for logging (`full` vs `alert_shell`).
 * Alert alone still blocks auth via detect (REQ-003); this util is for notes.
 */
export const isPortalLoginSiteFailureSignaturePresent = async (
  page: PortalPage,
): Promise<PortalLoginSiteFailureSignatureResult> => {
  const alert = await detectPortalLoginSiteProcessingAlert(page);
  if (!alert.present) {
    return { present: false };
  }

  const captchaBlockPresent = await isPortalLoginCaptchaBlockPresent(page);
  const passwordDiscover = await discoverLoginPasswordControl(page);
  const passwordPresent = passwordDiscover.ok === true;
  const full = passwordPresent && captchaBlockPresent;

  return {
    present: true,
    signature: full ? 'full' : 'alert_shell',
    alertText: alert.alertText,
    passwordPresent,
    captchaBlockPresent,
  };
};
