import { PORTAL_FORM_SELECT_LABELS_RU } from '../constants/portal-form-select-labels-ru.constants'

/** Show the Russian label when the interface language is Russian. */
export const translatePortalSelectLabel = (
  language: string,
  label: string,
): string => {
  if (!language.toLowerCase().startsWith('ru')) {
    return label
  }
  return PORTAL_FORM_SELECT_LABELS_RU[label] ?? label
}
