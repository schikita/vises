import { describe, expect, it } from 'vitest'
import { PORTAL_FORM_SELECT_FIELD_OPTIONS } from '../constants/portal-form-select-field-options.constants'
import { PORTAL_FORM_SELECT_LABELS_RU } from '../constants/portal-form-select-labels-ru.constants'
import { translatePortalSelectLabel } from './translate-portal-select-label.util'

describe('translatePortalSelectLabel', (): void => {
  it('keeps the English site label when the language is English', (): void => {
    expect(translatePortalSelectLabel('en', 'Male')).toBe('Male')
    expect(translatePortalSelectLabel('en', 'Russian Federation')).toBe(
      'Russian Federation',
    )
  })

  it('returns the Russian label for every site option when the language is Russian', (): void => {
    const labels = new Set<string>()
    for (const options of Object.values(PORTAL_FORM_SELECT_FIELD_OPTIONS)) {
      for (const option of options) {
        labels.add(option.label)
      }
    }

    for (const label of labels) {
      const translated = translatePortalSelectLabel('ru', label)
      expect(translated, label).not.toBe(label)
      expect(translated).toBe(PORTAL_FORM_SELECT_LABELS_RU[label])
    }
  })

  it('leaves an unmatched stored value unchanged', (): void => {
    expect(translatePortalSelectLabel('ru', 'Legacy Free Text')).toBe(
      'Legacy Free Text',
    )
  })
})
