import { EDIT_MEMBER_SECTION_FIELD_IDS } from '../constants';
import type {
  FillEditMemberSectionOptions,
  FillEditMemberSectionResult,
} from '../types/fill-edit-member-section.types';
import { applyEditMemberPlanField } from './apply-edit-member-plan-field.util';

/**
 * Fill one Edit Member section from the typed plan (ordered by plan order).
 */
export const fillEditMemberSection = async (
  options: FillEditMemberSectionOptions,
): Promise<FillEditMemberSectionResult> => {
  const sectionFieldIds = new Set(
    EDIT_MEMBER_SECTION_FIELD_IDS[options.sectionId],
  );
  const sectionEntries = options.fields.filter((entry) =>
    sectionFieldIds.has(entry.fieldId),
  );

  let fieldProgress = options.fieldProgress;
  const filled: string[] = [];
  const skipped: string[] = [];

  for (const entry of sectionEntries) {
    const applied = await applyEditMemberPlanField({
      surface: options.surface,
      entry,
      fieldProgress,
      priorFilledIds: options.priorFilledIds,
    });
    fieldProgress = applied.fieldProgress;
    if (!applied.ok) {
      return {
        ok: false,
        fieldProgress,
        reason: applied.reason,
        reasonCode: applied.reasonCode,
        ...(applied.notSafe ? { notSafe: true } : {}),
        failedFieldId: entry.fieldId,
      };
    }
    if (applied.outcome === 'filled') {
      filled.push(entry.fieldId);
    } else {
      skipped.push(entry.fieldId);
    }
  }

  return { ok: true, fieldProgress, filled, skipped };
};
