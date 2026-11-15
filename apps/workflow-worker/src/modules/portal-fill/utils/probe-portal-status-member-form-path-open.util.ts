import type { PortalPage } from '../types';
import type { ProbePortalStatusMemberFormPathOpenResult } from '../types/probe-portal-status-member-form-path-open.types';
import { isPortalApplicantEditFormVisible } from './is-portal-applicant-edit-form-visible.util';
import { isPortalVisaTypeModalVisible } from './is-portal-visa-type-modal-visible.util';
import { resolvePortalEditMemberFrame } from './resolve-portal-edit-member-frame.util';

/**
 * Probe live page for member form path already open (visa modal / edit frame /
 * edit form). Used before deciding whether to skip Add New Member re-click.
 */
export const probePortalStatusMemberFormPathOpen = async (
  page: PortalPage,
): Promise<ProbePortalStatusMemberFormPathOpenResult> => {
  const liveVisaModalVisible = await isPortalVisaTypeModalVisible(page);
  const frame = await resolvePortalEditMemberFrame(page);
  const liveEditFrameReady = frame != null;
  const liveEditFormVisible = frame
    ? await isPortalApplicantEditFormVisible(frame)
    : await isPortalApplicantEditFormVisible(page);

  return {
    liveVisaModalVisible,
    liveEditFrameReady,
    liveEditFormVisible,
    liveMemberFormPathOpen:
      liveVisaModalVisible || liveEditFrameReady || liveEditFormVisible,
  };
};
