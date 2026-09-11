/// <reference lib="dom" />
import path from 'node:path';
import { Logger } from '@nestjs/common';
import {
  DATE_FIELDS,
  DROPDOWN_FIELDS,
  NEVER_FILL,
  TEXT_FIELDS,
} from '../constants';
import type {
  FieldResult,
  MappingResult,
  PortalPage,
  WidgetOpResult,
} from '../types';
import { dismissConsentModalsInOrder } from './portal-consent-modals.util';
import {
  setDateField,
  setDropdownField,
  setTextField,
} from './portal-field-widgets.util';
import {
  assertMyForm,
  detectBlockingPage,
  readCountryCode,
} from './portal-page-guards.util';
import { maskSensitiveValue } from './portal-report.util';

const logger = new Logger('PortalFillPipeline');

const logFieldFailure = (row: FieldResult, stage: string): void => {
  logger.error(
    `field fill error [${stage}] ${row.field}: ${row.reason ?? 'unknown'}` +
      (row.value !== undefined
        ? ` (value=${maskSensitiveValue(row.field, row.value)})`
        : ''),
  );
};

const logHardFailure = (error: string): void => {
  logger.error(`fill pipeline hard failure: ${error}`);
};

const logAllFieldErrors = (fields: FieldResult[]): void => {
  const failed = fields.filter((f) => f.status === 'failed');
  if (failed.length === 0) {
    return;
  }
  logger.error(
    `form fill finished with ${failed.length} field error(s): ${failed
      .map(
        (f) =>
          `${f.field}=${f.reason ?? 'failed'}` +
          (f.value !== undefined
            ? ` value=${maskSensitiveValue(f.field, f.value)}`
            : ''),
      )
      .join('; ')}`,
  );
};

export type RunPortalFillPipelineOptions = {
  page: PortalPage;
  mapping: MappingResult;
  navTimeoutMs: number;
  screenshotPath?: string;
  skipCaptchaGuard?: boolean;
  clickVerify?: boolean;
};

export type RunPortalFillPipelineResult = {
  /** False on CAPTCHA/login/#myForm hard failures (maps to navigationOk: false). */
  ok: boolean;
  error?: string;
  fields: FieldResult[];
  countryCodeObserved?: string;
  screenshotPath?: string;
  usedStandIn?: boolean;
  verifyClicked: boolean;
};

/**
 * Shared post-navigation fill pipeline (DEC-007 / DEC-010).
 * Fixture vs live differ only by the URL already opened via page.goto.
 */
export async function runPortalFillPipeline(
  options: RunPortalFillPipelineOptions,
): Promise<RunPortalFillPipelineResult> {
  const fields: FieldResult[] = options.mapping.fields.map((f) => ({ ...f }));
  let usedStandIn = false;
  let verifyClicked = false;

  for (const row of fields) {
    if (row.status === 'failed') {
      logFieldFailure(row, 'mapping');
    }
  }

  if (!options.skipCaptchaGuard) {
    const blocked = await detectBlockingPage(options.page);
    if (blocked) {
      logHardFailure(blocked);
      return {
        ok: false,
        error: blocked,
        fields,
        usedStandIn,
        verifyClicked,
      };
    }
  }

  try {
    await options.page.waitForSelector('#myForm', {
      state: 'attached',
      timeout: options.navTimeoutMs,
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
        usedStandIn,
        verifyClicked,
      };
    }
  }

  await assertMyForm(options.page);

  await options.page
    .waitForFunction(
      () => {
        const standIn = (
          window as unknown as { __visesKendoStandIn?: { ready?: boolean } }
        ).__visesKendoStandIn;
        return (
          Boolean(standIn?.ready) ||
          Boolean(document.querySelector('#myForm'))
        );
      },
      { timeout: Math.min(5_000, options.navTimeoutMs) },
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
    options.navTimeoutMs,
  );
  if (!consent.ok) {
    const error = consent.error ?? 'consent modal dismissal failed';
    logHardFailure(error);
    return {
      ok: false,
      error,
      fields,
      usedStandIn,
      verifyClicked,
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

  const otpValue = await options.page.evaluate(() => {
    const el = document.querySelector(
      'input[name="EmailOtp"]',
    ) as HTMLInputElement | null;
    return el?.value ?? '';
  });
  if (otpValue.length > 0) {
    const idx = fields.findIndex((f) => f.field === 'EmailOtp');
    if (idx >= 0) {
      fields[idx] = {
        field: 'EmailOtp',
        status: 'failed',
        reason:
          'EmailOtp was non-empty after fill (must not be filled in v1)',
      };
      logFieldFailure(fields[idx], 'email-otp-guard');
    }
  }

  logAllFieldErrors(fields);

  // After all fields are filled: capture evidence screenshot, then return.
  // Do not click #btnVerify — stop at filled form + screenshot response.
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

  // Verify click disabled: fill → screenshot → return only.
  // if (options.clickVerify) {
  //   const verifyResult = await options.page.evaluate(() => {
  //     const byId = document.querySelector(
  //       '#btnVerify',
  //     ) as HTMLButtonElement | null;
  //     if (byId) {
  //       byId.click();
  //       return { ok: true as const, via: '#btnVerify' };
  //     }
  //     const buttons = Array.from(
  //       document.querySelectorAll('button, input[type="submit"], a'),
  //     );
  //     const match = buttons.find((el) => {
  //       const text = (el.textContent ?? (el as HTMLInputElement).value ?? '')
  //         .trim()
  //         .toLowerCase();
  //       return text === 'verify' || text.includes('verify');
  //     }) as HTMLElement | undefined;
  //     if (match) {
  //       match.click();
  //       return { ok: true as const, via: 'text=Verify' };
  //     }
  //     return { ok: false as const, via: 'not-found' };
  //   });
  //
  //   if (!verifyResult.ok) {
  //     return {
  //       ok: false,
  //       error: '#btnVerify / Verify control not found after fill',
  //       fields,
  //       countryCodeObserved: afterCountry ?? countryCodeObserved,
  //       screenshotPath,
  //       usedStandIn,
  //       verifyClicked: false,
  //     };
  //   }
  //   verifyClicked = true;
  // }

  return {
    ok: true,
    fields,
    countryCodeObserved: afterCountry ?? countryCodeObserved,
    screenshotPath,
    usedStandIn,
    verifyClicked,
  };
}
