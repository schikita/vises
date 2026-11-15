import type { PortalFieldName } from '../../portal-core/types/portal-field.types';
import type { EditMemberPortalFieldId } from './edit-member-portal-field.types';

/**
 * Field name accepted by shared Kendo helpers (RegisterUser + Edit Member).
 * Prefer typed ids; helpers also accept raw `#id` / id strings via selector resolve.
 */
export type PortalWidgetFieldName =
  | PortalFieldName
  | EditMemberPortalFieldId
  | (string & {});
