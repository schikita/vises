import { EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID } from '../constants/edit-member-portal-field.constants';
import { EDIT_MEMBER_FIELD_PLAN_ACTION } from '../constants/edit-member-field-plan-action.constants';
import type { EditMemberFillInput } from '../types/edit-member-fill-input.types';
import type { EditMemberLegacyTextFill } from '../types/edit-member-legacy-text-fill.types';

/**
 * Pull the four legacy text values from the typed fill plan (ids only when filled).
 * Does not invent; omits keys when plan action is not fill.
 */
export const extractEditMemberLegacyTextFill = (
  fill: EditMemberFillInput,
): EditMemberLegacyTextFill => {
  const byId = new Map(
    fill.fields.flatMap((entry) => {
      if (entry.action !== EDIT_MEMBER_FIELD_PLAN_ACTION.FILL) {
        return [];
      }
      if (typeof entry.value !== 'string') {
        return [];
      }
      const value: string = entry.value;
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return [];
      }
      return [[entry.fieldId, trimmed] as const];
    }),
  );

  const firstName = byId.get(EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.FirstName);
  const lastName = byId.get(EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.SurName);
  const placeOfBirth = byId.get(
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.PlaceOfBirth,
  );
  const passportNumber = byId.get(
    EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID.PassportNo,
  );

  return {
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(placeOfBirth ? { placeOfBirth } : {}),
    ...(passportNumber ? { passportNumber } : {}),
  };
};
