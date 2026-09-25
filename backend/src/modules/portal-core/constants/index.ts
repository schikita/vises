export {
  DEFAULT_REGISTER_PATH,
  DEFAULT_LOGIN_PATH,
  DEFAULT_MANAGE_APPLICANTS_PATH,
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_SKIP_CAPTCHA_GUARD,
  PORTAL_KEEP_OPEN_MS,
} from './portal-config.defaults.constants';

export { PORTAL_PASSPORT_TYPES } from './portal-passport-types.constants';

export { PORTAL_PASSPORT_ISSUE_COUNTRIES } from './portal-passport-issue-countries.constants';

export { SENSITIVE_FIELDS } from './portal-report.constants';

export {
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_APPLICATION_DATA,
  PORTAL_FIELD_MAPPER,
  PORTAL_SITE_ADAPTER_REGISTRY,
} from './portal-di.tokens';

export {
  PORTAL_SITE_ID_BELARUS,
  PORTAL_SITE_DISPLAY_NAME_BELARUS,
} from './portal-site-adapter.constants';

export {
  PORTAL_AUTOFILL_EVIDENCE_SUBDIR,
  PORTAL_AUTOFILL_CAPTURE_STATUS,
  PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT,
  PORTAL_AUTOFILL_RUN_LIST_MAX_LIMIT,
  type PortalAutofillCaptureStatus,
} from './portal-evidence.constants';

export {
  PORTAL_AUTOFILL_RUN_STATUS,
  PORTAL_AUTOFILL_PIPELINE_STAGE,
  PORTAL_AUTOFILL_CAPMONSTER_CB_STATE,
  PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS,
  PORTAL_AUTOFILL_LOCK_HEARTBEAT_MS,
  PORTAL_AUTOFILL_LOCK_STALE_MS,
  PORTAL_AUTOFILL_MSG_RUN_LOCKED,
  PORTAL_AUTOFILL_MSG_GONE,
} from './portal-autofill-run-lifecycle.constants';

/** Re-export email provider literals for PortalConfigService consumers. */
export {
  PORTAL_EMAIL_PROVIDER,
  type PortalEmailProviderValue,
} from '../../browser-mail/constants/portal-email-provider.constants';
