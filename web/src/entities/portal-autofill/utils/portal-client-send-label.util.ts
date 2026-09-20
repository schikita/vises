import { PORTAL_CLIENT_SEND_LABEL_RU } from '../constants'
import type { PortalClientPortalSendState } from '../types'

/** Russian label for client portal-send state (REQ-003). */
export const portalClientSendLabel = (
  send: PortalClientPortalSendState,
): string => PORTAL_CLIENT_SEND_LABEL_RU[send] ?? send
