import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalFieldName } from '../../portal-core/types/portal-field.types';
import type { PortalWidgetFieldName } from '../types/portal-widget-field.types';

/**
 * Resolve a CSS selector for RegisterUser or Edit Member field ids.
 * Register map wins when the name is a known RegisterUser field; otherwise
 * `#${id}` (or the string as-is when it already starts with `#`).
 */
export const resolvePortalFieldSelector = (
  name: PortalWidgetFieldName,
): string => {
  const raw = String(name).trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith('#')) {
    return raw;
  }
  const registerSelector =
    PORTAL_REGISTER_USER_SELECTORS.fields[raw as PortalFieldName];
  if (typeof registerSelector === 'string' && registerSelector.length > 0) {
    return registerSelector;
  }
  return `#${raw}`;
};
