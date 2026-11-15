import { EDIT_MEMBER_SECTION_FIELD_IDS } from '../constants';
import type { EditMemberFillSectionId } from '../constants/edit-member-section.constants';
import type { EditMemberFieldPlanEntry } from '../types/edit-member-fill-input.types';
import type { PortalStatusFieldProgress } from '../types/portal-status-checkpoint.types';

/**
 * True when every plan field in the section is already filled or skipped
 * (REQ-017 — skip completed sections on FORM_FILLING resume). Failed ids are
 * not complete and must be retried.
 */
export const isEditMemberSectionCompleteForResume = (
  sectionId: EditMemberFillSectionId,
  fields: readonly EditMemberFieldPlanEntry[],
  fieldProgress: PortalStatusFieldProgress,
  priorFilledIds: ReadonlySet<string>,
): boolean => {
  const sectionFieldIds = new Set(EDIT_MEMBER_SECTION_FIELD_IDS[sectionId]);
  const sectionEntries = fields.filter((entry) =>
    sectionFieldIds.has(entry.fieldId),
  );
  if (sectionEntries.length === 0) {
    return true;
  }

  const completedIds = new Set<string>([
    ...fieldProgress.filled,
    ...fieldProgress.skipped,
    ...priorFilledIds,
  ]);

  return sectionEntries.every((entry) => completedIds.has(entry.fieldId));
};
