import { PORTAL_DROPDOWN_UNSELECTED_LABELS } from '../constants';

/** True when display text is a catalogued unselected dropdown placeholder. */
export const isPortalDropdownUnselectedText = (
  text: string | undefined | null,
): boolean => {
  const normalized = String(text ?? '').trim();
  return (PORTAL_DROPDOWN_UNSELECTED_LABELS as readonly string[]).includes(
    normalized,
  );
};
