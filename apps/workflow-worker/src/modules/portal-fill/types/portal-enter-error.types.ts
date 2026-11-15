import { PORTAL_ENTER_ERROR_CODE } from '../constants/portal-enter-error.constants';

export type PortalEnterErrorCode =
  (typeof PORTAL_ENTER_ERROR_CODE)[keyof typeof PORTAL_ENTER_ERROR_CODE];
