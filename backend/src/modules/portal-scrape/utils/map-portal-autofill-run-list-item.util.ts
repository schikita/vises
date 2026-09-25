import {
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  PORTAL_AUTOFILL_RUN_STATUS,
  type PortalAutofillCaptureStatus,
} from '../constants';
import type { PortalAutofillRun } from '../../database/entities/portal-autofill-run.entity';
import type { PortalAutofillRunListItem } from '../types';
import { buildPortalAutofillCaptchaSummary } from './build-portal-autofill-captcha-summary.util';
import { buildPortalAutofillScreenshotDownloadPath } from './build-portal-autofill-screenshot-download-path.util';
import { resolvePortalAutofillRunStatus } from './resolve-portal-autofill-run-status.util';
import { summarizePortalFieldProgressJson } from '../../portal-core';

/**
 * Map a persisted run row to the enriched staff list DTO (DEC-007 / REQ-007).
 * `screenshotAvailable` requires terminal capture (`captured` + path); never for pending/live.
 * Secrets, relative paths, and raw captcha-service payloads are never included.
 */
export const mapPortalAutofillRunListItem = (
  run: PortalAutofillRun,
  nowMs: number = Date.now(),
): PortalAutofillRunListItem => {
  const screenshotAvailable =
    run.status !== PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS &&
    run.captureStatus === PORTAL_AUTOFILL_CAPTURE_STATUS.CAPTURED &&
    run.screenshotRelativePath != null &&
    run.screenshotRelativePath.length > 0;

  return {
    id: run.id,
    applicationId: run.applicationId,
    applicantId: run.applicantId,
    createdAt: run.createdAt.toISOString(),
    captureStatus: run.captureStatus as PortalAutofillCaptureStatus,
    reportOk: run.reportOk,
    errorNote: run.errorNote,
    screenshotAvailable,
    downloadPath: screenshotAvailable
      ? buildPortalAutofillScreenshotDownloadPath(run.id)
      : null,
    status: resolvePortalAutofillRunStatus(run.status),
    pipelineStage: run.pipelineStage,
    fieldProgressSummary: summarizePortalFieldProgressJson(run.fieldProgressJson),
    terminalReason: run.terminalReason,
    captcha: buildPortalAutofillCaptchaSummary(run, nowMs),
  };
};
