import {
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  type PortalAutofillCaptureStatus,
} from '../constants';
import type { PortalAutofillRun } from '../../database/entities/portal-autofill-run.entity';
import type { PortalAutofillRunListItem } from '../types';
import { buildPortalAutofillScreenshotDownloadPath } from './build-portal-autofill-screenshot-download-path.util';

/**
 * Map a persisted run row to the staff list DTO (DEC-001).
 * `screenshotAvailable` requires captured status and a non-null relative path.
 */
export const mapPortalAutofillRunListItem = (
  run: PortalAutofillRun,
): PortalAutofillRunListItem => {
  const screenshotAvailable =
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
  };
};
