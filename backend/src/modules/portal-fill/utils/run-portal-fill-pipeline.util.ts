/// <reference lib="dom" />
import path from 'node:path';
import { Logger } from '@nestjs/common';
import {
  PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
  PORTAL_CAPMONSTER_TIMEOUT_MS,
} from '../../capmonster/constants/capmonster.constants';
import { BROWSER_MAIL_SESSION_MISSING_ERROR } from '../../browser-mail/constants';
import { isBrowserMailSessionClosedError } from '../../browser-mail/utils';
import { MAILTM_WAIT_FOR_EMAIL_MS } from '../../mailtm/constants/mailtm.constants';
import { MAILTM_CIRCUIT_OPEN_REASON } from '../../mailtm/constants/mailtm-circuit.constants';
import { createMailTmCircuitBreaker } from '../../mailtm/utils/create-mailtm-circuit-breaker.util';
import { isMailTmClientError } from '../../mailtm/utils/is-mailtm-client-error.util';
import { recordMailTmCircuitFailure } from '../../mailtm/utils/record-mailtm-circuit-failure.util';
import { recordMailTmCircuitSuccess } from '../../mailtm/utils/record-mailtm-circuit-success.util';
import {
  DATE_FIELDS,
  DROPDOWN_FIELDS,
  NEVER_FILL,
  PORTAL_AUTOFILL_PIPELINE_STAGE,
  PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
  PORTAL_KENDO_WIDGET_READY_TIMEOUT_MS,
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_OTP_INPUT_RETRY_MAX,
  PORTAL_OTP_RESEND_MAX_ATTEMPTS,
  PORTAL_REGISTER_SUBMIT_SETTLE_MS,
  PORTAL_REGISTER_USER_SELECTORS,
  PORTAL_SKIP_CAPTCHA_GUARD,
  TEXT_FIELDS,
} from '../constants';
import type {
  FieldResult,
  PortalAutofillCheckpointPatch,
  PortalAutofillFieldProgressMap,
  RunPortalFillPipelineOptions,
  RunPortalFillPipelineResult,
  WidgetOpResult,
} from '../types';
import { assertMyForm } from './assert-my-form.util';
import { clickPortalGenerateOtp } from './click-portal-generate-otp.util';
import { clickPortalResendOtp } from './click-portal-resend-otp.util';
import { detectBlockingPage } from './detect-blocking-page.util';
import { dismissConsentModalsInOrder } from './dismiss-consent-modals-in-order.util';
import { dismissPortalOtpOkModal } from './dismiss-portal-otp-ok-modal.util';
import { fillPortalEmail } from './fill-portal-email.util';
import { fillPortalEmailOtp } from './fill-portal-email-otp.util';
import { formatPortalLogContext } from '../../portal-core/utils/format-portal-log-context.util';
import { isPortalEmailOtpControlUsable } from './is-portal-email-otp-control-usable.util';
import { logAllFieldErrors } from './log-all-field-errors.util';
import { logFieldFailure } from './log-field-failure.util';
import { logHardFailure } from './log-hard-failure.util';
import { mapFieldResultToProgressEntry } from './map-field-result-to-progress-entry.util';
import { mergePortalAutofillFieldProgress } from './merge-portal-autofill-field-progress.util';
import { readCountryCode } from './read-country-code.util';
import { restoreCaptchaCircuitFromCheckpoint } from './restore-captcha-circuit-from-checkpoint.util';
import { serializeCaptchaCircuitForCheckpoint } from './serialize-captcha-circuit-for-checkpoint.util';
import { isPortalDropdownUnselectedText } from './is-portal-dropdown-unselected-text.util';
import { setDateField } from './set-date-field.util';
import { setDropdownField } from './set-dropdown-field.util';
import { setTextField } from './set-text-field.util';
import { clickPortalCaptchaVerifyControl } from './click-portal-captcha-verify-control.util';
import { clickPortalRegisterSubmit } from './click-portal-register-submit.util';
import { runPortalCaptchaVerifiedLoop } from './run-portal-captcha-verified-loop.util';
import { summarizeFieldFillCounts } from '../../portal-core/utils/summarize-field-fill-counts.util';
import { verifyPortalRegisterSuccess } from './verify-portal-register-success.util';

const logger = new Logger('PortalFillPipeline');

/**
 * Shared post-navigation fill pipeline (DEC-007 / DEC-010).
 * Fixture vs live differ only by the URL already opened via page.goto.
 * Email OTP phase runs only when armed + captcha service succeeded (DEC-001 / CON-003).
 */
export const runPortalFillPipeline = async (
  options: RunPortalFillPipelineOptions,
): Promise<RunPortalFillPipelineResult> => {
  const fields: FieldResult[] = options.mapping.fields.map((f) => ({ ...f }));
  let usedStandIn = false;
  let verifyClicked = false;
  let emailOtpTouched = false;
  let captchaAttempted = false;
  let captchaOk = false;
  let emailOtpAttempted = false;
  let emailOtpOk = false;
  let emailOtpResendAttempts = 0;
  let mailProviderCircuitOpen = false;
  let temporaryMailboxCleanup: RunPortalFillPipelineResult['temporaryMailboxCleanup'];
  let temporaryMailboxAddress: string | undefined;
  let temporaryMailboxPassword: string | undefined;
  let emailOtpMessageId: string | undefined;
  let registerSubmitted = false;
  let registerSuccessVerified = false;
  let registerSubmitAmbiguous = false;
  const captchaServiceApiKey = options.captchaServiceApiKey?.trim() ?? '';
  const captchaEnabled = captchaServiceApiKey.length > 0;
  const otpPathArmed = options.otpPathArmed === true;
  const submitRegisterForm = options.submitRegisterForm === true;
  const logPrefix = formatPortalLogContext({
    applicationId: options.mapping.applicationId,
    applicantId: options.mapping.applicantId,
    runId: options.runId,
  });
  const logContext = {
    applicationId: options.mapping.applicationId,
    applicantId: options.mapping.applicantId,
    runId: options.runId,
  };

  let fieldProgress: PortalAutofillFieldProgressMap = {};
  const emitCheckpoint = async (
    patch: PortalAutofillCheckpointPatch,
  ): Promise<void> => {
    await options.checkpoint?.onCheckpoint?.(patch).catch(() => undefined);
    await options.checkpoint?.onHeartbeat?.().catch(() => undefined);
  };
  const checkpointStage = async (
    stage: (typeof PORTAL_AUTOFILL_PIPELINE_STAGE)[keyof typeof PORTAL_AUTOFILL_PIPELINE_STAGE],
  ): Promise<void> => {
    await emitCheckpoint({ pipelineStage: stage });
  };
  const checkpointField = async (row: FieldResult): Promise<void> => {
    fieldProgress = mergePortalAutofillFieldProgress(
      fieldProgress,
      row.field,
      mapFieldResultToProgressEntry(row),
    );
    await emitCheckpoint({
      pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.FIELD_FILL,
      fieldProgress,
    });
  };

  const baseResult = (): Omit<
    RunPortalFillPipelineResult,
    'ok' | 'error' | 'fields'
  > => ({
    usedStandIn,
    verifyClicked,
    emailOtpTouched,
    captchaAttempted,
    captchaOk,
    emailOtpAttempted,
    emailOtpOk,
    emailOtpResendAttempts: emailOtpAttempted ? emailOtpResendAttempts : undefined,
    mailProviderCircuitOpen: mailProviderCircuitOpen || undefined,
    temporaryMailboxCleanup,
    temporaryMailboxAddress,
    temporaryMailboxPassword,
    emailOtpMessageId,
    registerSubmitted: registerSubmitted || undefined,
    registerSuccessVerified: registerSuccessVerified || undefined,
    registerSubmitAmbiguous: registerSubmitAmbiguous || undefined,
  });

  for (const row of fields) {
    if (row.status === 'failed') {
      logFieldFailure(row, 'mapping');
    }
  }

  // DEC-005: captcha service on ⇒ ignore captcha clues, still abort on login wall.
  // captcha service off ⇒ PORTAL_SKIP_CAPTCHA_GUARD (fixed false) runs full guard.
  await checkpointStage(PORTAL_AUTOFILL_PIPELINE_STAGE.BLOCKING_PAGE_GUARD);
  logger.log(
    `${logPrefix} phase=blocking_page_guard start captchaServiceEnabled=${captchaEnabled}`,
  );
  if (captchaEnabled) {
    const blocked = await detectBlockingPage(options.page, {
      ignoreCaptchaClues: true,
    });
    if (blocked) {
      logger.log(
        `${logPrefix} phase=blocking_page_guard blocked=true mode=ignore_captcha_clues`,
      );
      logHardFailure(blocked);
      return {
        ok: false,
        error: blocked,
        fields,
        ...baseResult(),
      };
    }
    logger.log(
      `${logPrefix} phase=blocking_page_guard clear mode=ignore_captcha_clues`,
    );
  } else if (!PORTAL_SKIP_CAPTCHA_GUARD) {
    const blocked = await detectBlockingPage(options.page);
    if (blocked) {
      logger.log(
        `${logPrefix} phase=blocking_page_guard blocked=true mode=full_guard`,
      );
      logHardFailure(blocked);
      return {
        ok: false,
        error: blocked,
        fields,
        ...baseResult(),
      };
    }
    logger.log(
      `${logPrefix} phase=blocking_page_guard clear mode=full_guard`,
    );
  } else {
    logger.log(
      `${logPrefix} phase=blocking_page_guard skipped reason=PORTAL_SKIP_CAPTCHA_GUARD`,
    );
  }

  const formRoot = PORTAL_REGISTER_USER_SELECTORS.formRoot;
  const emailOtpSelector = PORTAL_REGISTER_USER_SELECTORS.fields.EmailOtp;
  const verifyControl = PORTAL_REGISTER_USER_SELECTORS.verifyControl;

  await checkpointStage(PORTAL_AUTOFILL_PIPELINE_STAGE.FORM_READY);
  logger.log(`${logPrefix} phase=form_ready start`);
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
      logger.error(`${logPrefix} phase=form_ready failure ${error}`);
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

  // DEC-010a: form-root alone is insufficient — wait until PassportType /
  // BirthCountry are resolvable via DEC-010 accessors or stand-in ready.
  const passportTypeSel = PORTAL_REGISTER_USER_SELECTORS.fields.PassportType;
  const birthCountrySel = PORTAL_REGISTER_USER_SELECTORS.fields.BirthCountry;

  try {
    await options.page.waitForFunction(
      ({
        formRootSel,
        passportTypeSelector,
        birthCountrySelector,
      }: {
        formRootSel: string;
        passportTypeSelector: string;
        birthCountrySelector: string;
      }) => {
        type JqHandle = {
          data: (key: string) => unknown;
          getKendoDropDownList?: () => unknown;
          getKendoComboBox?: () => unknown;
        };
        const win = window as unknown as {
          jQuery?: (el: Element) => JqHandle;
          $?: (el: Element) => JqHandle;
          kendo?: { widgetInstance?: (el: Element) => unknown };
          __visesKendoStandIn?: { ready?: boolean };
        };

        if (!document.querySelector(formRootSel)) return false;
        if (win.__visesKendoStandIn?.ready) return true;

        const jq = win.jQuery ?? win.$;

        const isDropdownResolvable = (sel: string): boolean => {
          const el = document.querySelector(sel);
          if (!el) return false;
          if (jq) {
            const handle = jq(el);
            if (
              handle.data('kendoDropDownList') ||
              handle.data('kendoComboBox')
            ) {
              return true;
            }
            if (
              typeof handle.getKendoDropDownList === 'function' &&
              handle.getKendoDropDownList()
            ) {
              return true;
            }
            if (
              typeof handle.getKendoComboBox === 'function' &&
              handle.getKendoComboBox()
            ) {
              return true;
            }
          }
          if (typeof win.kendo?.widgetInstance === 'function') {
            return Boolean(win.kendo.widgetInstance(el));
          }
          return false;
        };

        return (
          isDropdownResolvable(passportTypeSelector) &&
          isDropdownResolvable(birthCountrySelector)
        );
      },
      {
        formRootSel: formRoot,
        passportTypeSelector: passportTypeSel,
        birthCountrySelector: birthCountrySel,
      },
      {
        timeout: Math.min(
          PORTAL_KENDO_WIDGET_READY_TIMEOUT_MS,
          PORTAL_NAV_TIMEOUT_MS,
        ),
      },
    );
  } catch {
    const error =
      'RegisterUser Kendo widgets not resolvable on #PassportType/#BirthCountry within readiness budget';
    logger.error(`${logPrefix} phase=form_ready failure ${error}`);
    logHardFailure(error);
    return {
      ok: false,
      error,
      fields,
      ...baseResult(),
    };
  }

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
  logger.log(
    `${logPrefix} phase=form_ready success usedStandIn=${usedStandIn}`,
  );

  // Consent/attention modals before CountryCode observation + field fill (DEC-001).
  await checkpointStage(PORTAL_AUTOFILL_PIPELINE_STAGE.CONSENT);
  logger.log(`${logPrefix} phase=consent start`);
  const consent = await dismissConsentModalsInOrder(
    options.page,
    PORTAL_NAV_TIMEOUT_MS,
  );
  if (!consent.ok) {
    const error = consent.error ?? 'consent modal dismissal failed';
    logger.error(`${logPrefix} phase=consent failure ${error}`);
    logHardFailure(error);
    return {
      ok: false,
      error,
      fields,
      ...baseResult(),
    };
  }
  logger.log(`${logPrefix} phase=consent success`);

  const countryCodeObserved = await readCountryCode(options.page);

  await checkpointStage(PORTAL_AUTOFILL_PIPELINE_STAGE.FIELD_FILL);
  logger.log(`${logPrefix} phase=field_fill start`);
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
        await checkpointField(fields[i]);
      }
      continue;
    }

    if (row.status !== 'filled' || row.value === undefined) {
      await checkpointField(row);
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
      await checkpointField(fields[i]);
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
        await checkpointField(fields[i]);
        continue;
      }
      if (norm && norm !== intended.slice(0, 10)) {
        fields[i] = {
          ...row,
          status: 'failed',
          reason: `date read-back mismatch: intended=${intended} visible=${visible}`,
        };
        logFieldFailure(fields[i], 'date-readback');
        await checkpointField(fields[i]);
        continue;
      }
    }

    if (DROPDOWN_FIELDS.has(row.field)) {
      const shown = String(result.text ?? result.visible ?? '');
      const bound = String(result.value ?? '').trim();
      if (isPortalDropdownUnselectedText(shown)) {
        fields[i] = {
          ...row,
          status: 'failed',
          reason: `dropdown still unselected (placeholder): intended=${intended} got=${shown || '(empty)'}`,
        };
        logFieldFailure(fields[i], 'dropdown-readback');
        await checkpointField(fields[i]);
        continue;
      }
      if (!bound) {
        fields[i] = {
          ...row,
          status: 'failed',
          reason: `dropdown bound value empty after fill: intended=${intended} text=${shown || '(empty)'}`,
        };
        logFieldFailure(fields[i], 'dropdown-readback');
        await checkpointField(fields[i]);
        continue;
      }
      if (shown !== intended) {
        fields[i] = {
          ...row,
          status: 'failed',
          reason: `dropdown read-back mismatch: intended=${intended} got=${shown}`,
        };
        logFieldFailure(fields[i], 'dropdown-readback');
        await checkpointField(fields[i]);
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
    await checkpointField(fields[i]);
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
      await checkpointField(fields[idx]);
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
            'EmailOtp was non-empty after fill (must not be filled when email OTP path is off)',
        };
        logFieldFailure(fields[idx], 'email-otp-guard');
        await checkpointField(fields[idx]);
      }
    }
  }

  logAllFieldErrors(fields);
  {
    const counts = summarizeFieldFillCounts(fields);
    logger.log(
      `${logPrefix} phase=field_fill complete filled=${counts.filled} failed=${counts.failed} skipped=${counts.skipped}`,
    );
  }

  // After fill: evidence screenshot, then optional captcha Verify + BLS solve.
  // Non-captcha-service path: no Verify click (REQ-012 / DEC-005).
  let screenshotPath: string | undefined;
  if (options.screenshotPath) {
    const resolved = path.resolve(options.screenshotPath);
    await checkpointStage(PORTAL_AUTOFILL_PIPELINE_STAGE.SCREENSHOT);
    logger.log(`${logPrefix} phase=screenshot start`);
    try {
      await options.page.screenshot({ path: resolved, fullPage: true });
      screenshotPath = resolved;
      logger.log(`${logPrefix} phase=screenshot success`);
    } catch (err) {
      // PNG I/O failure must not flip fill success to hard-fail (DEC-006).
      // Orchestration records capture_failed when the file is missing.
      logger.error(
        `${logPrefix} phase=screenshot soft_failure ${err instanceof Error ? err.message : String(err)} (path=${resolved})`,
      );
    }
  } else {
    logger.log(`${logPrefix} phase=screenshot skipped reason=no_path`);
  }

  logger.log(
    `${logPrefix} decision captchaService enabled=${captchaEnabled}`,
  );
  if (captchaEnabled) {
    captchaAttempted = true;
    await checkpointStage(PORTAL_AUTOFILL_PIPELINE_STAGE.CAPMONSTER_VERIFY);
    logger.log(`${logPrefix} phase=captcha_verify start`);
    try {
      await clickPortalCaptchaVerifyControl(options.page);
    } catch (err) {
      const error =
        err instanceof Error
          ? err.message
          : `${verifyControl} not found after fill`;
      logger.error(`${logPrefix} phase=captcha_verify failure ${error}`);
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
    logger.log(
      `${logPrefix} phase=captcha_verify success via=${verifyControl}`,
    );

    const timeoutMs = PORTAL_CAPMONSTER_TIMEOUT_MS;
    const pollIntervalMs = PORTAL_CAPMONSTER_POLL_INTERVAL_MS;

    // Absolute deadline: restore on resume, else now + MAX_MS (DEC-003).
    const budgetDeadlineAt =
      options.captchaRestore?.budgetDeadlineAt ??
      new Date(Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS);
    const restoredAttempts = Math.max(
      0,
      options.captchaRestore?.attempts ?? 0,
    );
    const restoredCircuit = options.captchaRestore?.circuit
      ? restoreCaptchaCircuitFromCheckpoint(options.captchaRestore.circuit)
      : undefined;

    await emitCheckpoint({
      pipelineStage: PORTAL_AUTOFILL_PIPELINE_STAGE.CAPMONSTER_VERIFIED_LOOP,
      captchaAttempt: restoredAttempts,
      captchaBudgetDeadlineAt: budgetDeadlineAt,
      capmonsterCb: restoredCircuit
        ? serializeCaptchaCircuitForCheckpoint(restoredCircuit)
        : undefined,
      capmonsterInflightTaskId: null,
    });

    logger.log(`${logPrefix} phase=captcha_verified_loop start`);
    const captchaProvider = options.captchaProvider;
    if (!captchaProvider) {
      const error = 'captcha service was not injected';
      logger.error(`${logPrefix} phase=captcha_verified_loop failure ${error}`);
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

    // DEC-005: always re-enter Verified loop when captcha service enabled (no skip on prior ok).
    const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
      captchaServiceApiKey: captchaServiceApiKey,
      timeoutMs,
      pollIntervalMs,
      captchaProvider,
      logContext,
      restoredAttempts,
      budgetDeadlineAt,
      restoredCircuit,
      onHeartbeat: options.checkpoint?.onHeartbeat,
      abortSignal: options.abortSignal,
      onAttemptCheckpoint: async (snapshot) => {
        await emitCheckpoint({
          pipelineStage:
            PORTAL_AUTOFILL_PIPELINE_STAGE.CAPMONSTER_VERIFIED_LOOP,
          captchaAttempt: snapshot.attempts,
          captchaBudgetDeadlineAt: snapshot.budgetDeadlineAt,
          capmonsterCb: serializeCaptchaCircuitForCheckpoint(
            snapshot.circuit,
          ),
          capmonsterPermanentFailed: snapshot.permanentFailed === true,
          capmonsterInflightTaskId: snapshot.inflightTaskId ?? null,
        });
      },
    });

    if (!loopResult.ok) {
      const error = `captcha Verified loop failed (${loopResult.stopReason}): ${
        loopResult.error ?? 'unknown error'
      }`;
      logger.error(
        `${logPrefix} phase=captcha_verified_loop failure attempts=${loopResult.attempts} ${error}`,
      );
      logHardFailure(error);
      return {
        ok: false,
        error,
        ...(loopResult.errorCode
          ? { errorCode: loopResult.errorCode }
          : {}),
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }

    // REQ-001 / REQ-007: captcha success only when Verified control is present.
    captchaOk = true;
    logger.log(
      `${logPrefix} phase=captcha_verified_loop success attempts=${loopResult.attempts}`,
    );
  } else {
    logger.log(
      `${logPrefix} phase=captcha_verify skipped reason=captcha_service_disabled`,
    );
    logger.log(
      `${logPrefix} phase=captcha_verified_loop skipped reason=captcha_service_disabled`,
    );
  }

  // Post-captcha temporary-mailbox OTP UI (REQ-003–REQ-009 / DEC-001 / DEC-008).
  // Submit remains commented stub only (DEC-009).
  if (otpPathArmed && captchaOk) {
    emailOtpAttempted = true;
    await checkpointStage(PORTAL_AUTOFILL_PIPELINE_STAGE.OTP);
    logger.log(
      `${logPrefix} decision emailOtpPath armed=true proceeding=true`,
    );

    const mailProvider = options.mailProvider;
    if (!mailProvider) {
      const error = 'Temporary email provider missing for armed OTP path';
      logger.error(`${logPrefix} phase=mailtm_create failure ${error}`);
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

    const emailContextKey =
      options.emailContextKey?.trim() || options.runId?.trim() || '';
    const mailTmCircuit = createMailTmCircuitBreaker();

    logger.log(`${logPrefix} phase=mailtm_create start`);
    let mailTmToken: string;
    try {
      const account = await mailProvider.createAccount(
        { contextKey: emailContextKey },
        { circuit: mailTmCircuit },
      );
      recordMailTmCircuitSuccess(mailTmCircuit);
      temporaryMailboxCleanup = {
        contextKey: emailContextKey,
        accountId: account.id,
        token: account.token,
      };
      temporaryMailboxAddress = account.address;
      mailTmToken = account.token;
      temporaryMailboxPassword = account.password;
      logger.log(`${logPrefix} phase=mailtm_create success`);
    } catch (err) {
      if (isMailTmClientError(err)) {
        const recorded = recordMailTmCircuitFailure(
          mailTmCircuit,
          err.failureClass,
          Date.now(),
        );
        if (recorded.outcome === 'circuit_open') {
          mailProviderCircuitOpen = true;
        }
        logger.warn(
          `${logPrefix} phase=mailtm_create circuit_record outcome=${recorded.outcome}`,
        );
      }
      const error =
        err instanceof Error ? err.message : 'temporary mailbox create account failed';
      if (error === MAILTM_CIRCUIT_OPEN_REASON) {
        mailProviderCircuitOpen = true;
      }
      logger.error(`${logPrefix} phase=mailtm_create failure ${error}`);
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

    logger.log(`${logPrefix} phase=otp_email_fill start`);
    if (!temporaryMailboxAddress) {
      const error = 'temporary mailbox address missing after create';
      logger.error(`${logPrefix} phase=otp_email_fill failure ${error}`);
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
    const emailFill = await fillPortalEmail(options.page, temporaryMailboxAddress);
    if (!emailFill.ok) {
      const error = emailFill.reason ?? 'Email fill failed';
      logger.error(`${logPrefix} phase=otp_email_fill failure ${error}`);
      logHardFailure(error);
      const idx = fields.findIndex((f) => f.field === 'Email');
      if (idx >= 0) {
        fields[idx] = {
          field: 'Email',
          status: 'failed',
          reason: error,
        };
        logFieldFailure(fields[idx], 'email-fill');
        await checkpointField(fields[idx]);
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
    {
      const idx = fields.findIndex((f) => f.field === 'Email');
      if (idx >= 0) {
        fields[idx] = {
          field: 'Email',
          status: 'filled',
          reason: 'from temporary mailbox disposable account (post-captcha)',
          value: temporaryMailboxAddress,
        };
        await checkpointField(fields[idx]);
      }
    }
    logger.log(`${logPrefix} phase=otp_email_fill success`);

    // Wait → extract → optional single Resend (DEC-001 / DEC-002 / DEC-007 / DEC-008).
    // Arm wait Promise before Generate/Resend; Ok only after successful extract.
    let extractedOtp: string | undefined;
    let extractedSource: string | undefined;

    while (extractedOtp === undefined) {
      logger.log(
        `${logPrefix} phase=otp_wait_email arm start resendAttempts=${emailOtpResendAttempts}`,
      );

      const waitPromise = mailProvider.waitLatestMessage(
        {
          contextKey: emailContextKey,
          token: mailTmToken,
          timeoutMs: MAILTM_WAIT_FOR_EMAIL_MS,
          unreadOnly: true,
        },
        { circuit: mailTmCircuit },
      );

      if (emailOtpResendAttempts === 0) {
        logger.log(`${logPrefix} phase=otp_generate start`);
        const generate = await clickPortalGenerateOtp(options.page);
        if (!generate.ok) {
          const error = generate.error;
          logger.error(`${logPrefix} phase=otp_generate failure ${error}`);
          await waitPromise.catch(() => undefined);
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
        logger.log(
          `${logPrefix} phase=otp_generate success via=${generate.via}`,
        );
      } else {
        logger.log(
          `${logPrefix} phase=otp_resend start attempt=${emailOtpResendAttempts} max=${PORTAL_OTP_RESEND_MAX_ATTEMPTS}`,
        );
        const resend = await clickPortalResendOtp(options.page);
        if (!resend.ok) {
          logger.error(`${logPrefix} phase=otp_resend failure ${resend.error}`);
          await waitPromise.catch(() => undefined);
          logHardFailure(resend.error);
          return {
            ok: false,
            error: resend.error,
            fields,
            countryCodeObserved: afterCountry ?? countryCodeObserved,
            screenshotPath,
            ...baseResult(),
          };
        }
        logger.log(
          `${logPrefix} phase=otp_resend success via=${resend.via}`,
        );
      }

      let emailBody: string | undefined;
      let shouldResend = false;
      let failureError: string | undefined;

      try {
        const latest = await waitPromise;
        recordMailTmCircuitSuccess(mailTmCircuit);
        emailBody = latest.body;
        emailOtpMessageId = latest.messageId;
        logger.log(`${logPrefix} phase=otp_wait_email success`);
      } catch (err) {
        if (isMailTmClientError(err)) {
          const recorded = recordMailTmCircuitFailure(
            mailTmCircuit,
            err.failureClass,
            Date.now(),
          );
          if (recorded.outcome === 'circuit_open') {
            mailProviderCircuitOpen = true;
          }
          logger.warn(
            `${logPrefix} phase=otp_wait_email circuit_record outcome=${recorded.outcome}`,
          );
        }
        failureError =
          err instanceof Error
            ? err.message
            : 'temporary mailbox wait for message failed';
        logger.error(
          `${logPrefix} phase=otp_wait_email failure ${failureError}`,
        );

        const circuitOpen =
          failureError === MAILTM_CIRCUIT_OPEN_REASON || mailProviderCircuitOpen;
        if (failureError === MAILTM_CIRCUIT_OPEN_REASON) {
          mailProviderCircuitOpen = true;
        }
        const permanentFailure =
          isMailTmClientError(err) && err.failureClass === 'permanent';
        // DEC-004: session missing / closed mid-wait → hard-fail; Resend cannot restore.
        const sessionMissing =
          failureError === BROWSER_MAIL_SESSION_MISSING_ERROR;
        const sessionClosed = isBrowserMailSessionClosedError(failureError);
        shouldResend =
          emailOtpResendAttempts < PORTAL_OTP_RESEND_MAX_ATTEMPTS &&
          !circuitOpen &&
          !permanentFailure &&
          !sessionMissing &&
          !sessionClosed;
      }

      if (emailBody !== undefined && !shouldResend) {
        logger.log(`${logPrefix} phase=otp_extract start`);
        const extracted = mailProvider.extractOtp({ body: emailBody });
        if (extracted.ok) {
          extractedOtp = extracted.otp;
          extractedSource = extracted.source;
          logger.log(
            `${logPrefix} phase=otp_extract success source=${extracted.source}`,
          );
          break;
        }
        failureError = extracted.reason;
        logger.error(
          `${logPrefix} phase=otp_extract failure ${failureError}`,
        );
        shouldResend =
          emailOtpResendAttempts < PORTAL_OTP_RESEND_MAX_ATTEMPTS;
      }

      if (!shouldResend) {
        const error = failureError ?? 'temporary mailbox OTP wait/extract failed';
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

      emailOtpResendAttempts += 1;
    }

    if (!extractedOtp) {
      const error = 'OTP extract failed after wait/resend budget';
      logger.error(`${logPrefix} phase=otp_fill failure ${error}`);
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

    // DEC-002: Ok after OTP grab (soft-skip when modal absent and EmailOtp usable).
    logger.log(`${logPrefix} phase=otp_ok_modal start`);
    const okModal = await dismissPortalOtpOkModal(options.page);
    if (!okModal.ok) {
      const otpUsable = await isPortalEmailOtpControlUsable(options.page);
      if (!otpUsable) {
        const error = okModal.error;
        logger.error(`${logPrefix} phase=otp_ok_modal failure ${error}`);
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
      logger.log(
        `${logPrefix} phase=otp_ok_modal skipped reason=modal_absent_email_otp_usable`,
      );
    } else {
      logger.log(
        `${logPrefix} phase=otp_ok_modal success via=${okModal.via}`,
      );
    }

    // DEC-006 / DEC-007: keyboard OTP entry + bounded input retries (cached OTP).
    let otpInputError: string | undefined;
    for (
      let attempt = 0;
      attempt <= PORTAL_OTP_INPUT_RETRY_MAX;
      attempt += 1
    ) {
      logger.log(
        `${logPrefix} phase=otp_fill start attempt=${attempt + 1} max=${PORTAL_OTP_INPUT_RETRY_MAX + 1}`,
      );
      const otpFill = await fillPortalEmailOtp(options.page, extractedOtp);
      if (!otpFill.ok) {
        otpInputError = otpFill.reason ?? 'EmailOtp fill failed';
        logger.error(
          `${logPrefix} phase=otp_fill failure attempt=${attempt + 1} ${otpInputError}`,
        );
        continue;
      }

      emailOtpTouched = true;
      {
        const idx = fields.findIndex((f) => f.field === 'EmailOtp');
        if (idx >= 0) {
          fields[idx] = {
            field: 'EmailOtp',
            status: 'filled',
            reason: `filled via temporary mailbox OTP (${extractedSource ?? 'unknown'})`,
            // NFR-001 / AC-010: never store raw OTP in field notes/reports.
            value: undefined,
          };
          await checkpointField(fields[idx]);
        }
      }
      logger.log(
        `${logPrefix} phase=otp_fill success attempt=${attempt + 1} (value masked in reports)`,
      );

      if (!submitRegisterForm) {
        emailOtpOk = true;
        break;
      }

      logger.log(
        `${logPrefix} phase=register_submit start attempt=${attempt + 1}`,
      );
      const submitClick = await clickPortalRegisterSubmit(options.page);
      if (!submitClick.ok) {
        const afterMiss = await verifyPortalRegisterSuccess(options.page, {
          waitMs: 5_000,
          settleMs: 0,
        });
        if (afterMiss.ok) {
          emailOtpOk = true;
          registerSubmitted = true;
          registerSuccessVerified = true;
          logger.log(
            `${logPrefix} phase=register_submit success via=pre_nav_verify (${submitClick.error})`,
          );
          break;
        }
        otpInputError =
          submitClick.error ?? 'RegisterUser #btnSubmit click failed';
        logger.error(
          `${logPrefix} phase=register_submit failure attempt=${attempt + 1} ${otpInputError}`,
        );
        continue;
      }

      registerSubmitted = true;
      logger.log(
        `${logPrefix} phase=register_submit clicked via=${submitClick.via}`,
      );

      const verified = await verifyPortalRegisterSuccess(options.page, {
        settleMs: PORTAL_REGISTER_SUBMIT_SETTLE_MS,
      });
      if (!verified.ok) {
        otpInputError =
          verified.reason ?? 'RegisterUser success page not confirmed';
        logger.error(
          `${logPrefix} phase=register_verify failure attempt=${attempt + 1} ${otpInputError}`,
        );
        continue;
      }

      emailOtpOk = true;
      registerSuccessVerified = true;
      logger.log(
        `${logPrefix} phase=register_verify success via=${verified.via}`,
      );
      break;
    }

    if (!emailOtpOk) {
      const error =
        otpInputError ??
        'Email OTP input/submit retries exhausted';
      logger.error(`${logPrefix} phase=otp_fill failure ${error}`);
      logHardFailure(error);
      const idx = fields.findIndex((f) => f.field === 'EmailOtp');
      if (idx >= 0 && fields[idx]?.status !== 'filled') {
        fields[idx] = {
          field: 'EmailOtp',
          status: 'failed',
          reason: error,
        };
        logFieldFailure(fields[idx], 'email-otp-fill');
        await checkpointField(fields[idx]);
      }
      if (submitRegisterForm && registerSubmitted && !registerSuccessVerified) {
        registerSubmitAmbiguous = true;
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

    // Legacy path: OTP fill succeeds without `#btnSubmit` (staff sync autofill).
    // Workflow path opts in via `submitRegisterForm` (REQ-009 / DEC-019).
  } else {
    const skipReason = !otpPathArmed
      ? 'not_armed'
      : 'captcha_service_not_ok';
    logger.log(
      `${logPrefix} decision emailOtpPath armed=${otpPathArmed} skipped=true reason=${skipReason}`,
    );
    logger.log(
      `${logPrefix} phase=otp_generate skipped reason=${skipReason}`,
    );
  }

  if (submitRegisterForm) {
    if (registerSuccessVerified) {
      logger.log(`${logPrefix} phase=pipeline overall success`);
      return {
        ok: true,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }

    if (otpPathArmed && !emailOtpOk) {
      const error =
        'Email OTP required before RegisterUser submit (OTP path armed)';
      logger.error(`${logPrefix} phase=register_submit failure ${error}`);
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

    logger.log(`${logPrefix} phase=register_submit start`);

    // VERIFY_THEN_REPEAT retry: already on success page → COMPLETED without re-click.
    const alreadyOk = await verifyPortalRegisterSuccess(options.page, {
      waitMs: 2_000,
      settleMs: 0,
    });
    if (alreadyOk.ok) {
      registerSuccessVerified = true;
      logger.log(
        `${logPrefix} phase=register_submit already_verified via=${alreadyOk.via}`,
      );
      logger.log(`${logPrefix} phase=pipeline overall success`);
      return {
        ok: true,
        fields,
        countryCodeObserved: afterCountry ?? countryCodeObserved,
        screenshotPath,
        ...baseResult(),
      };
    }

    const submitClick = await clickPortalRegisterSubmit(options.page);
    if (!submitClick.ok) {
      const afterMiss = await verifyPortalRegisterSuccess(options.page, {
        waitMs: 5_000,
        settleMs: 0,
      });
      if (afterMiss.ok) {
        registerSuccessVerified = true;
        logger.log(
          `${logPrefix} phase=register_submit success via=pre_nav_verify (${submitClick.error})`,
        );
        logger.log(`${logPrefix} phase=pipeline overall success`);
        return {
          ok: true,
          fields,
          countryCodeObserved: afterCountry ?? countryCodeObserved,
          screenshotPath,
          ...baseResult(),
        };
      }
      registerSubmitAmbiguous = true;
      const error =
        submitClick.error ?? 'RegisterUser #btnSubmit click failed';
      logger.error(`${logPrefix} phase=register_submit failure ${error}`);
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

    registerSubmitted = true;
    logger.log(
      `${logPrefix} phase=register_submit clicked via=${submitClick.via}`,
    );

    const verified = await verifyPortalRegisterSuccess(options.page, {
      settleMs: PORTAL_REGISTER_SUBMIT_SETTLE_MS,
    });
    if (!verified.ok) {
      registerSubmitAmbiguous = true;
      const error =
        verified.reason ?? 'RegisterUser success page not confirmed';
      logger.error(`${logPrefix} phase=register_verify failure ${error}`);
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

    registerSuccessVerified = true;
    logger.log(
      `${logPrefix} phase=register_verify success via=${verified.via}`,
    );
  }

  logger.log(`${logPrefix} phase=pipeline overall success`);
  return {
    ok: true,
    fields,
    countryCodeObserved: afterCountry ?? countryCodeObserved,
    screenshotPath,
    ...baseResult(),
  };
};
