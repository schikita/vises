export { normalizeTargetUrl } from './normalize-target-url.util';
export { mapAutofillReportToHttpOutcome } from './map-autofill-http-status.util';
export { mappingOk } from './mapping-ok.util';
export { maskSensitiveValue, buildReport } from './portal-report.util';
export { runPortalFillPipeline } from './portal-fill-pipeline.util';
export { dismissConsentModalsInOrder } from './portal-consent-modals.util';
export {
  buildEvidenceRelativePath,
  buildEvidenceAbsolutePath,
  resolveEvidenceAbsolutePath,
  ensureEvidenceDir,
  evidenceFileExists,
  openEvidenceStream,
  unlinkEvidenceBestEffort,
} from './portal-evidence-fs.util';
export { buildPortalAutofillScreenshotDownloadPath } from './build-portal-autofill-screenshot-download-path.util';
export { mapPortalAutofillRunListItem } from './map-portal-autofill-run-list-item.util';
export { clampPortalAutofillRunListLimit } from './clamp-portal-autofill-run-list-limit.util';
