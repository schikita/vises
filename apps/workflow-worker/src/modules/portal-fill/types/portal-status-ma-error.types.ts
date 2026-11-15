import { PORTAL_STATUS_MA_ERROR_CODE } from '../constants/portal-status-ma-error.constants';

export type PortalStatusMaErrorCode =
  (typeof PORTAL_STATUS_MA_ERROR_CODE)[keyof typeof PORTAL_STATUS_MA_ERROR_CODE];
