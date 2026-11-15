import type { EDIT_MEMBER_PORTAL_FIELD_ID } from '../constants/edit-member-portal-field.constants';

/** Edit Member portal field id (DOM `#id` / radio `name`). */
export type EditMemberPortalFieldId =
  (typeof EDIT_MEMBER_PORTAL_FIELD_ID)[keyof typeof EDIT_MEMBER_PORTAL_FIELD_ID];
