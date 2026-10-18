/** Public API for BLS domain clients + proxy port (DEC-008 / DEC-015 / DEC-017). */
export { BlsClientsModule } from './bls-clients.module';
export {
  ProxyAdapter,
  Proxy6ProxyProviderAdapter,
} from './providers/proxy6-proxy-provider.adapter';
export { BlsRegisterClientService } from './register/bls-register-client.service';
/** @deprecated Prefer BlsRegisterClientService (TASK-008). Kept for reference. */
export { StubBlsRegisterClient } from './register/stub-bls-register-client.service';
export { BlsLoginClientService } from './login/bls-login-client.service';
/** @deprecated Prefer BlsLoginClientService (TASK-009). Kept for reference. */
export { StubBlsLoginClient } from './login/stub-bls-login-client.service';
export { BlsPasswordChangeClientService } from './password-change/bls-password-change-client.service';
/** @deprecated Prefer BlsPasswordChangeClientService (TASK-010). Kept for reference. */
export { StubBlsPasswordChangeClient } from './password-change/stub-bls-password-change-client.service';
export { BlsStatusClientService } from './status/bls-status-client.service';
/** @deprecated Prefer BlsStatusClientService (TASK-011). Kept for reference. */
export { StubBlsStatusClient } from './status/stub-bls-status-client.service';
export { BlsBookingClientService } from './booking/bls-booking-client.service';
/** @deprecated Prefer BlsBookingClientService (TASK-012). Kept for reference. */
export { StubBlsBookingClient } from './booking/stub-bls-booking-client.service';

export {
  PROXY_PROVIDER,
  BLS_REGISTER_CLIENT,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_STATUS_CLIENT,
  BLS_BOOKING_CLIENT,
  BLS_CLIENT_STUB_ERROR_CODE,
  BLS_CLIENT_STUB_ERROR_MESSAGE,
  BLS_CLIENT_UNKNOWN_TASK_ERROR_CODE,
  BLS_CLIENT_UNKNOWN_TASK_ERROR_MESSAGE,
  BLS_REGISTER_NO_APPLICANT_ERROR_CODE,
  BLS_REGISTER_NO_APPLICANT_ERROR_MESSAGE,
  BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_REGISTER_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  BLS_REGISTER_PIPELINE_ERROR_CODE,
  BLS_REGISTER_MID_RUN_DATE_GATE_ERROR_CODE,
  BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_CODE,
  BLS_REGISTER_PORTAL_PASSWORD_EMAIL_ERROR_MESSAGE,
  BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_LOGIN_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  BLS_LOGIN_PIPELINE_ERROR_CODE,
  BLS_LOGIN_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_LOGIN_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_LOGIN_SITE_PROCESSING_ERROR_CODE,
  BLS_LOGIN_SITE_PROCESSING_ERROR_MESSAGE,
  BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_PASSWORD_CHANGE_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  BLS_PASSWORD_CHANGE_PIPELINE_ERROR_CODE,
  BLS_PASSWORD_CHANGE_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_PASSWORD_CHANGE_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_PASSWORD_CHANGE_SKIP_REASON_NOT_PRESENTED,
  BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE,
  BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_MESSAGE,
  BLS_STATUS_PIPELINE_ERROR_CODE,
  BLS_STATUS_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_STATUS_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_STATUS_MISSING_APPLICANT_ERROR_CODE,
  BLS_STATUS_MISSING_APPLICANT_ERROR_MESSAGE,
  BLS_STATUS_UNKNOWN_ERROR_CODE,
  BLS_STATUS_UNKNOWN_ERROR_MESSAGE,
  BLS_STATUS_NOT_READY_ERROR_CODE,
  BLS_STATUS_NOT_READY_ERROR_MESSAGE,
  BLS_BOOKING_PIPELINE_ERROR_CODE,
  BLS_BOOKING_MISSING_EMAIL_ERROR_MESSAGE,
  BLS_BOOKING_MISSING_PASSWORD_ERROR_MESSAGE,
  BLS_BOOKING_UI_NOT_OPEN_ERROR_CODE,
  BLS_BOOKING_UI_NOT_OPEN_ERROR_MESSAGE,
  BLS_BOOKING_NOT_SAFE_ERROR_CODE,
  BLS_BOOKING_NOT_SAFE_ERROR_MESSAGE,
} from './constants';

export type {
  ProxyProvider,
  CaptchaProvider,
  BlsRegisterClient,
  BlsLoginClient,
  BlsPasswordChangeClient,
  BlsStatusClient,
  BlsBookingClient,
} from './interfaces';

export type {
  BlsClientRegisterCloseHook,
  BlsClientTaskContext,
  BlsClientResult,
  BlsAutofillRunLinkedMetadata,
  BlsDomainClientKind,
  ProxyProviderAcquireInput,
  ProxyProviderLease,
  CaptchaProviderSolveInput,
  CaptchaProviderSolveResult,
} from './types';

export {
  buildBlsClientAbortResult,
  buildBlsClientStubFailure,
  resolveBlsDomainClientKind,
} from './utils';
