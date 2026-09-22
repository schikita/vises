import { Logger } from '@nestjs/common';
import type {
  RunPortalPasswordChangePipelineOptions,
  RunPortalPasswordChangePipelineResult,
} from '../types';
import { clickPortalPasswordChangeSubmit } from './click-portal-password-change-submit.util';
import { fillPortalPasswordChangeForm } from './fill-portal-password-change-form.util';
import { isPortalPasswordChangeFormVisible } from './is-portal-password-change-form-visible.util';
import { runPortalLoginPrepPipeline } from './run-portal-login-prep-pipeline.util';
import { verifyPortalPasswordChangeSuccess } from './verify-portal-password-change-success.util';

const logger = new Logger('runPortalPasswordChangePipeline');

/**
 * Login (vaulted current password) then conditional forced password change
 * (REQ-012 / TASK-010). Same browser session — no storageState (DEC-016).
 * Never logs password values.
 */
export const runPortalPasswordChangePipeline = async (
  options: RunPortalPasswordChangePipelineOptions,
): Promise<RunPortalPasswordChangePipelineResult> => {
  const logPrefix = options.logPrefix ?? 'portal-password-change';
  const notes: string[] = [];

  const login = await runPortalLoginPrepPipeline({
    page: options.page,
    portalFormEmail: options.portalFormEmail,
    capMonsterApiKey: options.capMonsterApiKey,
    capMonster: options.capMonster,
    logPrefix: `${logPrefix}/login`,
    submitPassword: true,
    portalPassword: options.currentPassword,
  });
  notes.push(...login.notes);

  if (!login.ok || login.loginAuthenticatedVerified !== true) {
    const error =
      login.error?.slice(0, 500) ??
      'login before password change failed';
    logger.error(`${logPrefix} phase=login failure ${error}`);
    return {
      ok: false,
      submitAmbiguous:
        login.passwordSubmitAmbiguous === true ||
        login.passwordSubmitted === true,
      error,
      notes,
    };
  }

  notes.push('authenticated landing before password-change probe');
  logger.log(`${logPrefix} phase=login success`);

  const forcedUi = await isPortalPasswordChangeFormVisible(options.page);
  if (!forcedUi) {
    notes.push('forced password change UI not presented');
    logger.log(`${logPrefix} phase=detect not_presented`);
    return { ok: true, notPresented: true, notes };
  }

  notes.push('forced password change UI detected');
  logger.log(`${logPrefix} phase=detect presented`);

  const filled = await fillPortalPasswordChangeForm(options.page, {
    currentPassword: options.currentPassword,
    newPassword: options.newPassword,
  });
  if (!filled.ok) {
    const error = filled.reason ?? 'password change form fill failed';
    logger.error(`${logPrefix} phase=fill failure ${error}`);
    notes.push(`fill failed: ${error}`);
    return { ok: false, error, notes };
  }
  notes.push('change password fields filled (values masked)');
  logger.log(`${logPrefix} phase=fill success`);

  const clicked = await clickPortalPasswordChangeSubmit(options.page);
  if (!clicked.ok) {
    const error = clicked.error;
    logger.error(`${logPrefix} phase=submit failure ${error}`);
    notes.push(`submit failed: ${error}`);
    return { ok: false, error, notes };
  }
  notes.push('Update Password clicked');
  logger.log(`${logPrefix} phase=submit clicked`);

  const verified = await verifyPortalPasswordChangeSuccess(options.page);
  if (!verified.ok) {
    const error =
      verified.reason ?? 'password change success not confirmed';
    logger.error(`${logPrefix} phase=verify failure ${error}`);
    notes.push(`verify failed: ${error}`);
    return { ok: false, submitAmbiguous: true, error, notes };
  }

  notes.push(`password change verified via=${verified.via}`);
  logger.log(`${logPrefix} phase=verify success via=${verified.via}`);
  return { ok: true, notPresented: false, passwordChanged: true, notes };
};
