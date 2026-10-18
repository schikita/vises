import { Logger } from '@nestjs/common';
import {
  BLS_APPLICANT_PORTAL_STATUS,
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_EDIT_SETTLE_MS,
} from '../constants';
import type {
  RunPortalStatusValidatePipelineOptions,
  RunPortalStatusValidatePipelineResult,
} from '../types';
import { acceptPortalAttentionModal } from './accept-portal-attention-modal.util';
import { areRequiredApplicantsReadyToBook } from './are-required-applicants-ready-to-book.util';
import { clickPortalApplicantEdit } from './click-portal-applicant-edit.util';
import { clickPortalApplicantEditSubmit } from './click-portal-applicant-edit-submit.util';
import { fillPortalApplicantEditForm } from './fill-portal-applicant-edit-form.util';
import { isBlsApplicantPortalStatusReadyToBook } from './is-bls-applicant-portal-status-ready-to-book.util';
import { isPortalApplicantEditFormVisible } from './is-portal-applicant-edit-form-visible.util';
import { matchPortalApplicantStatusRow } from './match-portal-applicant-status-row.util';
import { runPortalLoginPrepPipeline } from './run-portal-login-prep-pipeline.util';
import { scrapePortalApplicantStatusRows } from './scrape-portal-applicant-status-rows.util';
import { waitForPortalManageApplicantsPage } from './wait-for-portal-manage-applicants-page.util';

const logger = new Logger('runPortalStatusValidatePipeline');

/**
 * Login → Manage Applicants → scrape/normalize status; when
 * FORM_FILLING_IN_PROGRESS attempt edit + attention Accept + submit,
 * then re-scrape. READY_TO_BOOK only is success (REQ-018 / REQ-019).
 */
export const runPortalStatusValidatePipeline = async (
  options: RunPortalStatusValidatePipelineOptions,
): Promise<RunPortalStatusValidatePipelineResult> => {
  const logPrefix = options.logPrefix ?? 'portal-status-validate';
  const notes: string[] = [];

  const login = await runPortalLoginPrepPipeline({
    page: options.page,
    portalFormEmail: options.portalFormEmail,
    captchaServiceApiKey: options.captchaServiceApiKey,
    captchaProvider: options.captchaProvider,
    logPrefix: `${logPrefix}/login`,
    submitPassword: true,
    portalPassword: options.portalPassword,
    abortSignal: options.abortSignal,
  });
  notes.push(...login.notes);

  if (!login.ok || login.loginAuthenticatedVerified !== true) {
    const error =
      login.error?.slice(0, 500) ?? 'login before status validate failed';
    logger.error(`${logPrefix} phase=login failure ${error}`);
    return {
      ok: false,
      submitAmbiguous:
        login.passwordSubmitAmbiguous === true ||
        login.passwordSubmitted === true,
      error,
      ...(login.errorCode ? { errorCode: login.errorCode } : {}),
      notes,
    };
  }

  notes.push('authenticated landing before status validate');
  logger.log(`${logPrefix} phase=login success`);

  try {
    await options.page.goto(options.manageApplicantsUrl, {
      waitUntil: 'domcontentloaded',
      timeout: PORTAL_NAV_TIMEOUT_MS,
    });
  } catch (err) {
    const error = `manage applicants navigation failed: ${
      err instanceof Error ? err.message : String(err)
    }`;
    logger.error(`${logPrefix} phase=navigate failure ${error}`);
    return { ok: false, error, notes };
  }
  notes.push('navigated to Manage Applicants');

  const pageReady = await waitForPortalManageApplicantsPage(options.page);
  if (!pageReady.ok) {
    logger.error(`${logPrefix} phase=page_ready failure ${pageReady.error}`);
    return { ok: false, error: pageReady.error, notes };
  }

  const readMatched = async () => {
    const rows = await scrapePortalApplicantStatusRows(options.page);
    notes.push(`scraped_applicant_rows=${rows.length}`);
    const matched = matchPortalApplicantStatusRow({
      rows,
      applicant: options.applicant,
    });
    return { rows, matched };
  };

  let { rows, matched } = await readMatched();
  if (!matched) {
    const error = 'applicant row not found on Manage Applicants';
    logger.error(`${logPrefix} phase=match failure ${error}`);
    return { ok: false, error, notes };
  }

  notes.push(
    `matched_status=${matched.status} raw=${matched.statusRaw.slice(0, 80)}`,
  );
  logger.log(
    `${logPrefix} phase=scrape status=${matched.status} rowIndex=${matched.rowIndex}`,
  );

  if (isBlsApplicantPortalStatusReadyToBook(matched.status)) {
    const gateOk = areRequiredApplicantsReadyToBook({
      statuses: [matched.status],
    });
    if (!gateOk) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        error: 'READY_TO_BOOK gate failed unexpectedly',
        notes,
      };
    }
    notes.push('applicant READY_TO_BOOK');
    return {
      ok: true,
      readyToBook: true,
      status: matched.status,
      statusRaw: matched.statusRaw,
      notes,
    };
  }

  let editAttempted = false;
  let attentionAccepted = false;

  if (
    matched.status === BLS_APPLICANT_PORTAL_STATUS.FORM_FILLING_IN_PROGRESS &&
    matched.hasEditAction
  ) {
    editAttempted = true;
    const editClick = await clickPortalApplicantEdit(options.page, {
      portalApplicantId: matched.portalApplicantId,
      rowIndex: matched.rowIndex,
    });
    if (!editClick.ok) {
      logger.error(`${logPrefix} phase=edit_click failure ${editClick.error}`);
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        error: editClick.error,
        notes,
      };
    }
    notes.push(`edit clicked via=${editClick.via}`);

    const attention = await acceptPortalAttentionModal(options.page);
    if (!attention.ok) {
      logger.error(
        `${logPrefix} phase=attention failure ${attention.error}`,
      );
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        error: attention.error,
        notes,
      };
    }
    attentionAccepted = attention.accepted;
    if (attention.accepted) {
      notes.push(`attention accepted via=${attention.via ?? 'Accept'}`);
    } else {
      notes.push('attention modal not presented');
    }

    const editVisible = await isPortalApplicantEditFormVisible(options.page);
    if (!editVisible) {
      const error = 'edit form not visible after Edit/Complete';
      logger.error(`${logPrefix} phase=edit_form failure ${error}`);
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        attentionAccepted,
        error,
        notes,
      };
    }

    if (options.editFill) {
      const filled = await fillPortalApplicantEditForm(
        options.page,
        options.editFill,
      );
      if (filled.ok) {
        notes.push(
          `edit fields filled=${filled.filled.join(',') || 'none'}`,
        );
      } else {
        notes.push(`edit fill skipped: ${filled.reason}`);
      }
    }

    const submitted = await clickPortalApplicantEditSubmit(options.page);
    if (!submitted.ok) {
      logger.error(`${logPrefix} phase=edit_submit failure ${submitted.error}`);
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        attentionAccepted,
        error: submitted.error,
        notes,
      };
    }
    notes.push(`edit submitted via=${submitted.via}`);
    logger.log(`${logPrefix} phase=edit_submit clicked`);

    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_STATUS_EDIT_SETTLE_MS),
    );

    try {
      await options.page.goto(options.manageApplicantsUrl, {
        waitUntil: 'domcontentloaded',
        timeout: PORTAL_NAV_TIMEOUT_MS,
      });
    } catch {
      notes.push('post-edit re-navigate soft-failed; scraping current page');
    }

    const afterReady = await waitForPortalManageApplicantsPage(options.page);
    if (!afterReady.ok) {
      return {
        ok: false,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        attentionAccepted,
        submitAmbiguous: true,
        error: afterReady.error,
        notes,
      };
    }

    ({ rows, matched } = await readMatched());
    if (!matched) {
      return {
        ok: false,
        editAttempted,
        attentionAccepted,
        submitAmbiguous: true,
        error: 'applicant row missing after edit submit',
        notes,
      };
    }
    notes.push(
      `post_edit_status=${matched.status} raw=${matched.statusRaw.slice(0, 80)}`,
    );

    if (isBlsApplicantPortalStatusReadyToBook(matched.status)) {
      notes.push('applicant READY_TO_BOOK after edit');
      return {
        ok: true,
        readyToBook: true,
        status: matched.status,
        statusRaw: matched.statusRaw,
        editAttempted,
        attentionAccepted,
        notes,
      };
    }

    return {
      ok: false,
      status: matched.status,
      statusRaw: matched.statusRaw,
      editAttempted,
      attentionAccepted,
      submitAmbiguous: true,
      error: `status after edit is ${matched.status} (not READY_TO_BOOK)`,
      notes,
    };
  }

  // UNKNOWN or FORM_FILLING without edit — never success.
  const error =
    matched.status === BLS_APPLICANT_PORTAL_STATUS.UNKNOWN
      ? `applicant status UNKNOWN (raw=${matched.statusRaw.slice(0, 120)})`
      : `applicant status ${matched.status} — not READY_TO_BOOK`;
  logger.error(`${logPrefix} phase=status failure ${error}`);
  return {
    ok: false,
    status: matched.status,
    statusRaw: matched.statusRaw,
    editAttempted,
    attentionAccepted,
    error,
    notes,
  };
};
