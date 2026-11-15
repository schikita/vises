import {
  PORTAL_STATUS_PAGE_WAIT_MS,
  PORTAL_STATUS_POLL_MS,
} from '../constants';
import type { PortalFrame, PortalPage } from '../types';
import { resolvePortalEditMemberFrame } from './resolve-portal-edit-member-frame.util';

/**
 * Wait until Edit Member iframe has `#myForm` ManageApplicant + `#FirstName`.
 */
export const waitForPortalEditMemberFrameReady = async (
  page: PortalPage,
): Promise<
  { ok: true; frame: PortalFrame } | { ok: false; error: string }
> => {
  const deadline = Date.now() + PORTAL_STATUS_PAGE_WAIT_MS;

  while (Date.now() < deadline) {
    const frame = await resolvePortalEditMemberFrame(page);
    if (frame) {
      return { ok: true, frame };
    }
    await new Promise((resolve) => setTimeout(resolve, PORTAL_STATUS_POLL_MS));
  }

  return {
    ok: false,
    error: `Edit Member iframe not ready within ${PORTAL_STATUS_PAGE_WAIT_MS}ms`,
  };
};
