import { EDIT_MEMBER_FILL_SECTION } from '../constants';
import type {
  FillEditMemberSectionOptions,
  FillEditMemberSectionResult,
} from '../types/fill-edit-member-section.types';
import { fillEditMemberSection } from './fill-edit-member-section.util';

export const fillEditMemberFingerprintInvitingSection = async (
  options: Omit<FillEditMemberSectionOptions, 'sectionId'>,
): Promise<FillEditMemberSectionResult> =>
  fillEditMemberSection({
    ...options,
    sectionId: EDIT_MEMBER_FILL_SECTION.FINGERPRINT_INVITING,
  });
