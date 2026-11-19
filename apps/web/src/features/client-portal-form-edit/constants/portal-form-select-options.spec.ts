import { describe, expect, it } from 'vitest'
import { BLS_COUNTRY_OPTIONS } from './bls-country-options.constants'
import { BLS_GENDER_OPTIONS } from './bls-gender-options.constants'
import { BLS_MARITAL_STATUS_OPTIONS } from './bls-marital-status-options.constants'
import { BLS_NATIONALITY_COUNTRY_OPTIONS } from './bls-nationality-country-options.constants'
import { BLS_PASSPORT_TYPE_OPTIONS } from './bls-passport-type-options.constants'
import { BLS_SCHENGEN_COUNTRY_OPTIONS } from './bls-schengen-country-options.constants'
import { PORTAL_FORM_SELECT_FIELD_OPTIONS } from './portal-form-select-field-options.constants'

const labelsOf = (
  options: readonly { label: string }[],
): string[] => options.map((option): string => option.label)

describe('portal form select option lists', (): void => {
  it('keeps gender, marital status, and passport labels in site order', (): void => {
    expect(labelsOf(BLS_GENDER_OPTIONS)).toEqual(['Male', 'Female'])
    expect(labelsOf(BLS_MARITAL_STATUS_OPTIONS)).toEqual([
      'Other',
      'Divorced',
      'Married',
      'Separated',
      'Single',
      'Widow(er)',
    ])
    expect(labelsOf(BLS_PASSPORT_TYPE_OPTIONS)).toContain('Ordinary Passport')
    expect(labelsOf(BLS_PASSPORT_TYPE_OPTIONS)).toContain('UN laissez-passer')
    expect(BLS_PASSPORT_TYPE_OPTIONS).toHaveLength(12)
  })

  it('uses nationalityCountryData (191) for country fields and countryData (190) for minor parent nationality', (): void => {
    expect(BLS_NATIONALITY_COUNTRY_OPTIONS).toHaveLength(191)
    expect(BLS_NATIONALITY_COUNTRY_OPTIONS[0]?.label).toBe('Armenia')
    expect(
      BLS_NATIONALITY_COUNTRY_OPTIONS[BLS_NATIONALITY_COUNTRY_OPTIONS.length - 1]
        ?.label,
    ).toBe('Yemen')
    expect(BLS_COUNTRY_OPTIONS).toHaveLength(190)
    expect(BLS_COUNTRY_OPTIONS[0]?.label).toBe('Armenia')
    expect(PORTAL_FORM_SELECT_FIELD_OPTIONS.minorParentNationality).toBe(
      BLS_COUNTRY_OPTIONS,
    )
    expect(PORTAL_FORM_SELECT_FIELD_OPTIONS.nationality).toBe(
      BLS_NATIONALITY_COUNTRY_OPTIONS,
    )
    expect(PORTAL_FORM_SELECT_FIELD_OPTIONS.countryOfBirth).toBe(
      BLS_NATIONALITY_COUNTRY_OPTIONS,
    )
    expect(
      labelsOf(BLS_NATIONALITY_COUNTRY_OPTIONS).filter(
        (label): boolean => label === 'Russian Federation',
      ),
    ).toHaveLength(1)
    expect(
      labelsOf(BLS_COUNTRY_OPTIONS).filter(
        (label): boolean => label === 'Russian Federation',
      ),
    ).toHaveLength(0)
    expect(
      labelsOf(BLS_COUNTRY_OPTIONS).filter(
        (label): boolean => label === 'Yemen',
      ),
    ).toHaveLength(2)
  })

  it('keeps the schengen list at 31 entries in site order', (): void => {
    expect(BLS_SCHENGEN_COUNTRY_OPTIONS).toHaveLength(31)
    expect(BLS_SCHENGEN_COUNTRY_OPTIONS[0]?.label).toBe('Czech Republic')
    expect(
      BLS_SCHENGEN_COUNTRY_OPTIONS[BLS_SCHENGEN_COUNTRY_OPTIONS.length - 1]
        ?.label,
    ).toBe('Switzerland')
    expect(PORTAL_FORM_SELECT_FIELD_OPTIONS.destination).toBe(
      BLS_SCHENGEN_COUNTRY_OPTIONS,
    )
    expect(PORTAL_FORM_SELECT_FIELD_OPTIONS.firstEntry).toBe(
      BLS_SCHENGEN_COUNTRY_OPTIONS,
    )
    expect(PORTAL_FORM_SELECT_FIELD_OPTIONS.memberStateSecondDestination).toBe(
      BLS_SCHENGEN_COUNTRY_OPTIONS,
    )
  })
})
