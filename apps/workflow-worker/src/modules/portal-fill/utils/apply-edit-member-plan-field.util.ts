import {
  EDIT_MEMBER_CHECKBOX_FIELD_IDS,
  EDIT_MEMBER_DATE_FIELD_IDS,
  EDIT_MEMBER_DROPDOWN_FIELD_IDS,
  EDIT_MEMBER_FIELD_PLAN_ACTION,
  EDIT_MEMBER_RADIO_FIELD_IDS,
  PORTAL_DATEPICKER_STALE_DEFAULT_YMD,
  PORTAL_STATUS_FIELD_FAIL_REASON,
} from '../constants';
import type {
  ApplyEditMemberPlanFieldOptions,
  ApplyEditMemberPlanFieldResult,
  WidgetOpResult,
} from '../types';
import { isEditMemberEnglishSafeText } from './is-edit-member-english-safe-text.util';
import { isEditMemberFieldAlreadyCorrect } from './is-edit-member-field-already-correct.util';
import { readEditMemberFieldCurrentValue } from './read-edit-member-field-current-value.util';
import {
  recordEditMemberFieldFailed,
  recordEditMemberFieldFilled,
  recordEditMemberFieldSkipped,
} from './record-edit-member-field-progress.util';
import { setDateField } from './set-date-field.util';
import { setDropdownField } from './set-dropdown-field.util';
import { setEditMemberCheckboxField } from './set-edit-member-checkbox-field.util';
import { setEditMemberRadioField } from './set-edit-member-radio-field.util';
import { setTextField } from './set-text-field.util';

/**
 * Apply one plan entry: resume skip, plan skip, gap fail-closed, or fill.
 * Never logs field values.
 */
export const applyEditMemberPlanField = async (
  options: ApplyEditMemberPlanFieldOptions,
): Promise<ApplyEditMemberPlanFieldResult> => {
  const { surface, entry, priorFilledIds } = options;
  let fieldProgress = options.fieldProgress;
  const fieldId = entry.fieldId;

  if (priorFilledIds.has(fieldId) || fieldProgress.filled.includes(fieldId)) {
    if (!fieldProgress.filled.includes(fieldId)) {
      fieldProgress = recordEditMemberFieldFilled(fieldProgress, fieldId);
    }
    return { ok: true, fieldProgress, outcome: 'skipped' };
  }

  if (entry.action === EDIT_MEMBER_FIELD_PLAN_ACTION.SKIP) {
    fieldProgress = recordEditMemberFieldSkipped(fieldProgress, fieldId);
    return { ok: true, fieldProgress, outcome: 'skipped' };
  }

  if (entry.action === EDIT_MEMBER_FIELD_PLAN_ACTION.UNSKIPPABLE_GAP) {
    const reasonCode =
      entry.reasonCode ??
      PORTAL_STATUS_FIELD_FAIL_REASON.REQUIRED_MISSING_SOURCE;
    fieldProgress = recordEditMemberFieldFailed(
      fieldProgress,
      fieldId,
      reasonCode,
    );
    return {
      ok: false,
      fieldProgress,
      reason: `Required portal field ${fieldId} has no CRM source — staff must supply data (NOT_SAFE; do not invent values)`,
      reasonCode,
      notSafe: true,
    };
  }

  const intended = typeof entry.value === 'string' ? entry.value.trim() : '';
  if (!intended) {
    fieldProgress = recordEditMemberFieldFailed(
      fieldProgress,
      fieldId,
      PORTAL_STATUS_FIELD_FAIL_REASON.REQUIRED_MISSING_SOURCE,
    );
    return {
      ok: false,
      fieldProgress,
      reason: `Required portal field ${fieldId} fill value empty — staff must supply data (NOT_SAFE)`,
      reasonCode: PORTAL_STATUS_FIELD_FAIL_REASON.REQUIRED_MISSING_SOURCE,
      notSafe: true,
    };
  }

  const current = await readEditMemberFieldCurrentValue(surface, fieldId);
  if (isEditMemberFieldAlreadyCorrect(current, intended)) {
    // Prefill already matches — count as filled for resume (REQ-017).
    fieldProgress = recordEditMemberFieldFilled(fieldProgress, fieldId);
    return { ok: true, fieldProgress, outcome: 'skipped' };
  }

  const isTextLike =
    !EDIT_MEMBER_DATE_FIELD_IDS.has(fieldId) &&
    !EDIT_MEMBER_DROPDOWN_FIELD_IDS.has(fieldId) &&
    !EDIT_MEMBER_RADIO_FIELD_IDS.has(fieldId) &&
    !EDIT_MEMBER_CHECKBOX_FIELD_IDS.has(fieldId);

  if (isTextLike && !isEditMemberEnglishSafeText(intended)) {
    fieldProgress = recordEditMemberFieldFailed(
      fieldProgress,
      fieldId,
      PORTAL_STATUS_FIELD_FAIL_REASON.ENGLISH_UNSAFE,
    );
    return {
      ok: false,
      fieldProgress,
      reason: `Field ${fieldId} value is not English-safe for portal validateEnglish — staff must correct CRM (NOT_SAFE)`,
      reasonCode: PORTAL_STATUS_FIELD_FAIL_REASON.ENGLISH_UNSAFE,
      notSafe: true,
    };
  }

  let result: WidgetOpResult;

  try {
    if (EDIT_MEMBER_RADIO_FIELD_IDS.has(fieldId)) {
      result = await setEditMemberRadioField(surface, fieldId, intended);
    } else if (EDIT_MEMBER_CHECKBOX_FIELD_IDS.has(fieldId)) {
      const wantChecked =
        intended === 'true' ||
        intended === '1' ||
        intended.toLowerCase() === 'yes';
      result = await setEditMemberCheckboxField(surface, fieldId, wantChecked);
    } else if (EDIT_MEMBER_DATE_FIELD_IDS.has(fieldId)) {
      result = await setDateField(surface, fieldId, intended);
    } else if (EDIT_MEMBER_DROPDOWN_FIELD_IDS.has(fieldId)) {
      result = await setDropdownField(surface, fieldId, intended);
    } else {
      result = await setTextField(surface, fieldId, intended);
    }
  } catch (err) {
    result = {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }

  if (!result.ok) {
    const stale =
      typeof result.reason === 'string' &&
      result.reason.includes(PORTAL_DATEPICKER_STALE_DEFAULT_YMD);
    const reasonCode = stale
      ? PORTAL_STATUS_FIELD_FAIL_REASON.STALE_DATEPICKER
      : PORTAL_STATUS_FIELD_FAIL_REASON.WIDGET_ERROR;
    fieldProgress = recordEditMemberFieldFailed(
      fieldProgress,
      fieldId,
      reasonCode,
    );
    return {
      ok: false,
      fieldProgress,
      reason: `Field ${fieldId} fill failed (${reasonCode})`,
      reasonCode,
    };
  }

  if (EDIT_MEMBER_DATE_FIELD_IDS.has(fieldId)) {
    const visible = String(result.visible ?? result.value ?? '').slice(0, 10);
    if (visible === PORTAL_DATEPICKER_STALE_DEFAULT_YMD) {
      fieldProgress = recordEditMemberFieldFailed(
        fieldProgress,
        fieldId,
        PORTAL_STATUS_FIELD_FAIL_REASON.STALE_DATEPICKER,
      );
      return {
        ok: false,
        fieldProgress,
        reason: `Field ${fieldId} datepicker still shows stale default`,
        reasonCode: PORTAL_STATUS_FIELD_FAIL_REASON.STALE_DATEPICKER,
      };
    }
  }

  fieldProgress = recordEditMemberFieldFilled(fieldProgress, fieldId);
  return { ok: true, fieldProgress, outcome: 'filled' };
};
