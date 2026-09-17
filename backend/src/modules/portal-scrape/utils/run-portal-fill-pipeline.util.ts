/// <reference lib="dom" />
import path from 'node:path';
import { Logger } from '@nestjs/common';
import {
  PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
  PORTAL_CAPMONSTER_TIMEOUT_MS,
} from '../../capmonster';
import {
  extractMailSlurpOtp,
  MAILSLURP_WAIT_FOR_EMAIL_MS,
  waitMailSlurpLatestEmail,
} from '../../mailslurp';
import {
  DATE_FIELDS,
  DROPDOWN_FIELDS,
  NEVER_FILL,
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_REGISTER_USER_SELECTORS,
  PORTAL_SKIP_CAPTCHA_GUARD,
  TEXT_FIELDS,
} from '../constants';
import type {
  FieldResult,
  RunPortalFillPipelineOptions,
  RunPortalFillPipelineResult,
  WidgetOpResult,
} from '../types';
import { assertMyForm } from './assert-my-form.util';
import { clickPortalGenerateOtp } from './click-portal-generate-otp.util';
import { detectBlockingPage } from './detect-blocking-page.util';
import { dismissConsentModalsInOrder } from './dismiss-consent-modals-in-order.util';
import { dismissPortalOtpOkModal } from './dismiss-portal-otp-ok-modal.util';
import { fillPortalEmailOtp } from './fill-portal-email-otp.util';
import { logAllFieldErrors } from './log-all-field-errors.util';
import { logFieldFailure } from './log-field-failure.util';
import { logHardFailure } from './log-hard-failure.util';
import { readCountryCode } from './read-country-code.util';
import { setDateField } from './set-date-field.util';
import { setDropdownField } from './set-dropdown-field.util';
import { setTextField } from './set-text-field.util';
import { solvePortalBlsCaptcha } from './portal-captcha-solve.util';
const logger = new Logger('PortalFillPipeline');

/**
 * Shared post-navigation fill pipeline (DEC-007 / DEC-010).
 * Fixture vs live differ only by the URL already opened via page.goto.
 * MailSlurp OTP phase runs only when armed + CapMonster succeeded (DEC-001/008).
 */
export const runPortalFillPipeline = async (
  options: RunPortalFillPipelineOptions,
): Promise<RunPortalFillPipelineResult> => {
  const fields: FieldResult[] = options.mapping.fields.map((f) => ({ ...f }));
  let usedStandIn = false;
  let verifyClicked = false;
  let emailOtpTouched = false;
  let capMonsterAttempted = false;
  let capMonsterOk = false;
  let mailSlurpOtpAttempted = false;
  let mailSlurpOtpOk = false;
  const capMonsterApiKey = options.capMonsterApiKey?.trim() ?? '';
  const capMonsterEnabled = capMonsterApiKey.length > 0;
  const mailSlurpApiKey = options.mailSlurpApiKey?.trim() ?? '';
  const mailSlurpInboxId = options.mailSlurpInboxId?.trim() ?? '';
  const otpPathArmed =
    mailSlurpApiKey.length > 0 && mailSlurpInboxId.length > 0;

  const baseResult = (): Omit<
    RunPortalFillPipelineResult,
    'ok' | 'error' | 'fields'
  > => ({
    usedStandIn,
    verifyClicked,
    emailOtpTouched,
    capMonsterAttempted,
    capMonsterOk,
    mailSlurpOtpAttempted,
    mailSlurpOtpOk,
  });

  for (const row of fields) {
    if (row.status === 'failed') {
      logFieldFailure(row, 'mapping');
    }
  }

  // DEC-005: CapMonster on ⇒ ignore captcha clues, still abort on login wall.
  // CapMonster off ⇒ PORTAL_SKIP_CAPTCHA_GUARD (fixed false) runs full guard.
  if (capMonsterEnabled) {
    const blocked = await detectBlockingPage(options.page, {
      ignoreCaptchaClues: true,
    });
    if (blocked) {
      logHardFailure(blocked);
      return {
        ok: false,
        error: blocked,
        fields,
        ...baseResult(),
      };
    }
  } else if (!PORTAL_SKIP_CAPTCHA_GUARD) {
    const blocked = await detectBlockingPage(options.page);
    if (blocked) {
      logHardFailure(blocked);
      return {
        ok: false,
        error: blocked,
        fields,
        ...baseResult(),
      };
    }
  }

  const formRoot = PORTAL_REGISTER_USER_SELECTORS.formRoot;
  const emailOtpSelector = PORTAL_REGISTER_USER_SELECTORS.fields.EmailOtp;
  const verifyControl = PORTAL_REGISTER_USER_SELECTORS.verifyControl;

  try {
    await options.page.waitForSelector(formRoot, {
      state: 'attached',
      timeout: PORTAL_NAV_TIMEOUT_MS,
    });
  } catch {
    try {
      await assertMyForm(options.page);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logHardFailure(error);
      return {
        ok: false,
        error,
        fields,
        ...baseResult(),
      };
    }
  }

  await assertMyForm(options.page);

  await options.page
    .waitForFunction(
      (formRootSel: string) => {
        const standIn = (
          window as unknown as { __visesKendoStandIn?: { ready?: boolean } }
        ).__visesKendoStandIn;
        return (
          Boolean(standIn?.ready) ||
          Boolean(document.querySelector(formRootSel))
        );
      },
      formRoot,
      { timeout: Math.min(5_000, PORTAL_NAV_TIMEOUT_MS) },
    )
    .catch(() => undefined);

  usedStandIn = await options.page.evaluate(() => {
    const hasHelper = Boolean(
      (window as unknown as { __visesKendoStandIn?: unknown })
        .__visesKendoStandIn,
    );
    const hasRoles = Boolean(
      document.querySelector(
        '[data-role="datepicker"], [data-role="dropdownlist"]',
      ),
    );
    return hasHelper || hasRoles;
  });

  // Consent/attention modals before CountryCode observation + field fill (DEC-001).
  const consent = await dismissConsentModalsInOrder(
    options.page,
    PORTAL_NAV_TIMEOUT_MS,
  );
  if (!consent.ok) {
    const error = consent.error ?? 'consent modal dismissal failed';
    logHardFailure(error);
    return {
      ok: false,
      error,
      fields,
      ...baseResult(),
    };
  }

  const countryCodeObserved = await readCountryCode(options.page);

  for (let i = 0; i < fields.length; i++) {
    const row = fields[i];
    if (NEVER_FILL.has(row.field)) {
      if (row.field === 'CountryCode') {
        fields[i] = {
          ...row,
          status: 'skipped',
          reason: row.reason ?? 'leave form default; do not overwrite',
          value: countryCodeObserved,
        };
      }
      continue;
    }

    if (row.status !== 'filled' || row.value === undefined) {
      continue;
    }

    const intended = row.value;
    let result: WidgetOpResult;

    try {
      if (DATE_FIELDS.has(row.field)) {
        result = await setDateField(options.page, row.field, intended);
      } else if (DROPDOWN_FIELDS.has(row.field)) {
        result = await setDropdownField(options.page, row.field, intended);
      } else if (TEXT_FIELDS.has(row.field)) {
        result = await setTextField(options.page, row.field, intended);
      } else {
        result = {
          ok: false,
          reason: `unsupported fill target: ${row.field}`,
        };
      }
    } catch (err) {
      result = {
        ok: false,
        reason: err instanceof Error ? err.message : String(err),
      };
    }

    if (!result.ok) {
      fields[i] = {
        ...row,
        status: 'failed',
        reason: result.reason ?? 'fill failed',
      };
      logFieldFailure(fields[i], 'widget');
      continue;
    }

    if (DATE_FIELDS.has(row.field)) {
      const visible = result.visible ?? result.value ?? '';
      const norm = visible.slice(0, 10);
      if (norm === '0001-01-01') {
        fields[i] = {
          ...row,
          status: 'failed',
          reason: 'datepicker still shows stale default 0001-01-01',
        };
        logFieldFailure(fields[i], 'date-readback');
        continue;
      }
      if (norm && norm !== intended.slice(0, 10)) {
        fields[i] = {
          ...row,
          status: 'failed',
          reason: `date read-back mismatch: intended=${intended} visible=${visible}`,
        };
        logFieldFailure(fields[i], 'date-readback');
        continue;
      }
    }

    if (DROPDOWN_FIELDS.has(row.field)) {
      const shown = result.text ?? result.visible ?? result.value;
      if (shown !== intended) {
        fields[i] = {
          ...row,
          status: 'failed',
          reason: `dropdown read-back mismatch: intended=${intended} got=${shown}`,
        };
        logFieldFailure(fields[i], 'dropdown-readback');
        continue;
      }
    }

    fields[i] = {
      ...row,
      status: 'filled',
      reason: [
        row.reason,
        result.via ? `filled via ${result.via}` : undefined,
      ]
        .filter(Boolean)
        .join('; '),
      value: intended,
    };
  }

  const afterCountry = await readCountryCode(options.page);
  if (
    countryCodeObserved !== undefined &&
    afterCountry !== undefined &&
    afterCountry !== countryCodeObserved
  ) {
    const idx = fields.findIndex((f) => f.field === 'CountryCode');
    if (idx >= 0) {
      fields[idx] = {
        field: 'CountryCode',
        status: 'failed',
        reason: `CountryCode changed unexpectedly from ${countryCodeObserved} to ${afterCountry}`,
        value: afterCountry,
      };
      logFieldFailure(fields[idx], 'country-code-guard');
    }
  }

  // DEC-009: empty-EmailOtp guard only when OTP path is NOT armed.
  if (!otpPathArmed) {
    const otpValue = await options.page.evaluate((sel: string) => {
      const el = document.querySelector(sel) as HTMLInputElement | null;
      return el?.value ?? '';
    }, emailOtpSelector);
    if (otpValue.length > 0) {
      const idx = fields.findIndex((f) => f.field === 'EmailOtp');
      if (idx >= 0) {
        fields[idx] = {
          field: 'EmailOtp',
          status: 'failed',
          reason:
            'EmailOtp was non-empty after fill (must not be filled when MailSlurp OTP path is off)',
        };
        logFieldFailure(fields[idx], 'email-otp-guard');
      }
    }
  }

  logAllFieldErrors(fields);

  // After fill: evidence screenshot, then optional CapMonster Verify + BLS solve.
  // Non-CapMonster path: no Verify click (REQ-012 / DEC-005).
  let screenshotPath: string | undefined;
  if (options.screenshotPath) {
    const resolved = path.resolve(options.screenshotPath);
    try {
      await options.page.screenshot({ path: resolved, fullPage: true });
      screenshotPath = resolved;
    } catch (err) {
      // PNG I/O failure must not flip fill success to hard-fail (DEC-006).
      // Orchestration records capture_failed when the file is missing.
      logger.error(
        `screenshot capture failed: ${err instanceof Error ? err.message : String(err)} (path=${resolved})`,
      );
    }
  }

  if (capMonsterEnabled) {
    capMonsterAttempted = true;
    const verifyResult = await options.page.evaluate((verifySel: string) => {
      const btn = document.querySelector(
        verifySel,
      ) as HTMLButtonElement | null;
      if (!btn) {
        return { ok: false as const, via: 'not-found' };
      }
      btn.click();
      return { ok: true as const, via: verifySel };
    }, verifyControl);

    if (!verifyResult.ok) {
      const error = `${verifyControl} not found after fill`;
      logHardFailure(error);
      return {
        ok: false,
        error,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }
    verifyClicked = true;
    logger.log(`CapMonster path: Verify clicked via ${verifyResult.via}`);

    const timeoutMs = PORTAL_CAPMONSTER_TIMEOUT_MS;
    const pollIntervalMs = PORTAL_CAPMONSTER_POLL_INTERVAL_MS;

    try {
      await solvePortalBlsCaptcha(options.page, {
        clientKey: capMonsterApiKey,
        timeoutMs,
        pollIntervalMs,
        waitTimeoutMs: timeoutMs,
      });
      capMonsterOk = true;
    } catch (err) {
      const error = `CapMonster solve failed: ${
        err instanceof Error ? err.message : String(err)
      }`;
      logHardFailure(error);
      return {
        ok: false,
        error,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }
  }

  // Post-CapMonster MailSlurp OTP UI (REQ-004–REQ-009). No Resend (DEC-006).
  if (otpPathArmed && capMonsterOk) {
    mailSlurpOtpAttempted = true;

    const generate = await clickPortalGenerateOtp(options.page);
    if (!generate.ok) {
      const error = generate.error;
      logHardFailure(error);
      return {
        ok: false,
        error,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }
    logger.log(`OTP path: Generate clicked via ${generate.via}`);

    const okModal = await dismissPortalOtpOkModal(options.page);
    if (!okModal.ok) {
      const error = okModal.error;
      logHardFailure(error);
      return {
        ok: false,
        error,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }
    logger.log(`OTP path: Ok modal dismissed via ${okModal.via}`);

    let emailId: string;
    let emailBody: string;
    try {
      const latest = await waitMailSlurpLatestEmail({
        apiKey: mailSlurpApiKey,
        inboxId: mailSlurpInboxId,
        timeoutMs: MAILSLURP_WAIT_FOR_EMAIL_MS,
        unreadOnly: true,
      });
      emailId = latest.emailId;
      emailBody = latest.body;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : 'MailSlurp wait for email failed';
      logHardFailure(error);
      return {
        ok: false,
        error,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }

    const extracted = await extractMailSlurpOtp({
      apiKey: mailSlurpApiKey,
      emailId,
      body: emailBody,
    });
    if (!extracted.ok) {
      const error = extracted.reason;
      logHardFailure(error);
      return {
        ok: false,
        error,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }

    const otpFill = await fillPortalEmailOtp(options.page, extracted.otp);
    if (!otpFill.ok) {
      const error = otpFill.reason ?? 'EmailOtp fill failed';
      logHardFailure(error);
      const idx = fields.findIndex((f) => f.field === 'EmailOtp');
      if (idx >= 0) {
        fields[idx] = {
          field: 'EmailOtp',
          status: 'failed',
          reason: error,
        };
        logFieldFailure(fields[idx], 'email-otp-fill');
      }
      return {
        ok: false,
        error,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }

    emailOtpTouched = true;
    mailSlurpOtpOk = true;
    {
      const idx = fields.findIndex((f) => f.field === 'EmailOtp');
      if (idx >= 0) {
        fields[idx] = {
          field: 'EmailOtp',
          status: 'filled',
          reason: `filled via MailSlurp OTP (${extracted.source})`,
          value: extracted.otp,
        };
      }
    }
    logger.log('OTP path: EmailOtp filled (value masked in reports)');

    // REQ-009 / CON-004: prepare `#btnSubmit` click but do not submit yet.
    // await options.page.evaluate((sel: string) => {
    //   const btn = document.querySelector(sel) as HTMLButtonElement | null;
    //   if (btn) btn.click();
    // }, PORTAL_REGISTER_USER_SELECTORS.submitControl);
  }

  return {
    ok: true,
    fields,
    countryCodeObserved: afterCountry ?? countryCodeObserved,
    screenshotPath,
    ...baseResult(),
  };
};
