import { Logger } from '@nestjs/common';
import {
  PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON,
  PORTAL_LOGIN_CREDENTIALS_ENSURE_PHASE,
  PORTAL_LOGIN_EMAIL_CONTROL_NOT_FOUND_REASON,
} from '../constants';
import type {
  EnsurePortalLoginCredentialFieldOutcome,
  EnsurePortalLoginCredentialsForCaptchaOptions,
  EnsurePortalLoginCredentialsForCaptchaResult,
  PortalPage,
} from '../types';
import { ensurePortalLoginEmailForCaptcha } from './ensure-portal-login-email-for-captcha.util';
import { ensurePortalLoginPasswordForCaptcha } from './ensure-portal-login-password-for-captcha.util';

const logger = new Logger('ensurePortalLoginCredentialsForCaptcha');

/**
 * Ensure supplied login email/password controls before captcha ensure/solve
 * (DEC-005). Neither supplied → no-op success. Fail-fast on first field failure.
 *
 * Two-step login: after email is submitted the password page has no email
 * input. When password is also supplied and email discovery finds no control,
 * skip email (password-only page) instead of hard-failing.
 * Never logs password values (REQ-008).
 */
export const ensurePortalLoginCredentialsForCaptcha = async (
  page: PortalPage,
  options: EnsurePortalLoginCredentialsForCaptchaOptions,
): Promise<EnsurePortalLoginCredentialsForCaptchaResult> => {
  const email = options.portalFormEmail?.trim() ?? '';
  const password = options.portalPassword?.trim() ?? '';
  const emailSupplied = email.length > 0;
  const passwordSupplied = password.length > 0;

  if (!emailSupplied && !passwordSupplied) {
    return { ok: true };
  }

  let emailOutcome: EnsurePortalLoginCredentialFieldOutcome | undefined;
  let passwordOutcome: EnsurePortalLoginCredentialFieldOutcome | undefined;

  if (emailSupplied) {
    emailOutcome = await ensurePortalLoginEmailForCaptcha(page, email);
    if (!emailOutcome.ok) {
      const reason =
        emailOutcome.reason ?? PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON;
      // Password step: email already consumed; page has password (+ captcha) only.
      const emailAbsentOnPasswordPage =
        passwordSupplied &&
        (reason === PORTAL_LOGIN_EMAIL_CONTROL_NOT_FOUND_REASON ||
          reason.includes('no Email-labeled inputs'));
      if (emailAbsentOnPasswordPage) {
        logger.log(
          `phase=${PORTAL_LOGIN_CREDENTIALS_ENSURE_PHASE} field=email outcome=skipped_absent_on_password_page`,
        );
        emailOutcome = undefined;
      } else {
        logger.warn(
          `phase=${PORTAL_LOGIN_CREDENTIALS_ENSURE_PHASE} field=email outcome=failed reason=${reason}`,
        );
        return { ok: false, reason, emailOutcome };
      }
    } else {
      logger.log(
        `phase=${PORTAL_LOGIN_CREDENTIALS_ENSURE_PHASE} field=email outcome=${emailOutcome.via ?? 'ok'}`,
      );
    }
  }

  if (passwordSupplied) {
    passwordOutcome = await ensurePortalLoginPasswordForCaptcha(page, password);
    if (!passwordOutcome.ok) {
      const reason =
        passwordOutcome.reason ?? PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON;
      logger.warn(
        `phase=${PORTAL_LOGIN_CREDENTIALS_ENSURE_PHASE} field=password outcome=failed reason=${reason}`,
      );
      return { ok: false, reason, emailOutcome, passwordOutcome };
    }
    logger.log(
      `phase=${PORTAL_LOGIN_CREDENTIALS_ENSURE_PHASE} field=password outcome=${passwordOutcome.via ?? 'ok'}`,
    );
  }

  return { ok: true, emailOutcome, passwordOutcome };
};
