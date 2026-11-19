import { afterEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen, userEvent, within } from '@/shared/testing'
import {
  BLS_NATIONALITY_COUNTRY_OPTIONS,
  PORTAL_FORM_ALL_FIELD_KEYS,
} from '../constants'
import type { ClientPortalFormValues } from '../types'
import { ClientPortalFormEditForm } from './ClientPortalFormEditForm'

const emptyValues = (): ClientPortalFormValues => {
  const values = {} as ClientPortalFormValues
  for (const key of PORTAL_FORM_ALL_FIELD_KEYS) {
    if (key === 'blsInvitingAuthority') {
      values.blsInvitingAuthority = ''
      continue
    }
    values[key] = ''
  }
  return values
}

const optionLabels = (select: HTMLElement): string[] =>
  Array.from(select.querySelectorAll('option')).map(
    (option): string => option.textContent ?? '',
  )

const renderForm = (defaultValues: ClientPortalFormValues): void => {
  render(
    <ClientPortalFormEditForm
      defaultValues={defaultValues}
      tripDisabled={false}
      tripDisabledMessage=""
      passportError=""
      portalFormError=""
      tripError=""
      saved={false}
      pending={false}
      onValidSubmit={vi.fn(async (): Promise<boolean> => true)}
    />,
  )
}

describe('portal form selectors, dates, and phones', (): void => {
  afterEach(async (): Promise<void> => {
    cleanup()
    await i18n.changeLanguage('en')
  })

  it('renders gender, marital status, and passport type in site order', (): void => {
    renderForm(emptyValues())

    expect(
      optionLabels(screen.getByRole('combobox', { name: /^gender/i })),
    ).toEqual(['--Select--', 'Male', 'Female'])
    expect(
      optionLabels(screen.getByRole('combobox', { name: /marital status/i })),
    ).toEqual([
      '--Select--',
      'Other',
      'Divorced',
      'Married',
      'Separated',
      'Single',
      'Widow(er)',
    ])
    const passportLabels = optionLabels(
      screen.getByRole('combobox', { name: /passport type/i }),
    )
    expect(passportLabels[0]).toBe('--Select--')
    expect(passportLabels).toContain('Ordinary Passport')
    expect(passportLabels).toContain('UN laissez-passer')
  })

  it('renders nationalityCountryData plus placeholder, and countryData for minor parent nationality', async (): Promise<void> => {
    const user = userEvent.setup()
    renderForm(emptyValues())

    const nationality = screen.getByRole('combobox', {
      name: /current nationality/i,
    })
    const nationalityLabels = optionLabels(nationality)
    expect(nationalityLabels).toHaveLength(
      BLS_NATIONALITY_COUNTRY_OPTIONS.length + 1,
    )
    expect(nationalityLabels[0]).toBe('--Select--')
    expect(nationalityLabels[1]).toBe(BLS_NATIONALITY_COUNTRY_OPTIONS[0]?.label)
    expect(nationalityLabels).toContain('Russian Federation')

    await user.click(screen.getByRole('checkbox', { name: /minors/i }))
    const minorNationality = screen
      .getAllByRole('combobox', {
        name: (name: string): boolean => name.trim() === 'Nationality',
      })
      .find((select): boolean => optionLabels(select).length === 191)
    if (minorNationality === undefined) {
      throw new Error('minor parent nationality select missing')
    }
    const minorLabels = optionLabels(minorNationality)
    expect(minorLabels).toHaveLength(191)
    expect(minorLabels[0]).toBe('--Select--')
    expect(minorLabels[1]).toBe('Armenia')
    expect(minorLabels).not.toContain('Russian Federation')
    expect(
      screen.getByRole('combobox', { name: /member state destination/i }),
    ).toBeTruthy()
    expect(
      optionLabels(
        screen.getByRole('combobox', { name: /member state destination/i }),
      ),
    ).toHaveLength(32)
  })

  it('shows Russian option labels when the interface language is Russian', async (): Promise<void> => {
    await i18n.changeLanguage('ru')
    renderForm(emptyValues())

    expect(optionLabels(screen.getByRole('combobox', { name: /^пол/i }))).toEqual(
      ['--Выберите--', 'Мужской', 'Женский'],
    )
    expect(
      optionLabels(screen.getByRole('combobox', { name: /семейное положение/i })),
    ).toContain('Женат / замужем')
    expect(
      optionLabels(screen.getByRole('combobox', { name: /гражданство в настоящее время/i })),
    ).toContain('Российская Федерация')
  })

  it('keeps a free-text value that is not in the list', (): void => {
    const values = emptyValues()
    values.gender = 'Legacy Free Text'
    renderForm(values)

    const gender = screen.getByRole('combobox', { name: /^gender/i })
    expect(optionLabels(gender)).toEqual([
      '--Select--',
      'Male',
      'Female',
      'Legacy Free Text',
    ])
    expect(gender).toHaveValue('Legacy Free Text')
  })

  it('strips non-digits as a phone number is typed', async (): Promise<void> => {
    const user = userEvent.setup()
    renderForm(emptyValues())

    const phone = screen.getAllByRole('textbox', { name: /^contact number/i })[0]
    if (phone === undefined) {
      throw new Error('contact number field missing')
    }
    await user.type(phone, '+34 600-000-000')

    expect(phone).toHaveValue('34600000000')
  })

  it('stores a calendar selection as yyyy-MM-dd and does not use input type=date', async (): Promise<void> => {
    const user = userEvent.setup()
    renderForm(emptyValues())

    const dob = screen.getAllByRole('textbox', { name: /date of birth/i })[0]
    if (dob === undefined) {
      throw new Error('date of birth field missing')
    }
    expect(dob.getAttribute('type')).not.toBe('date')
    expect(dob).toHaveValue('')

    const chooseDate = screen.getAllByRole('button', {
      name: /choose date, date of birth/i,
    })[0]
    if (chooseDate === undefined) {
      throw new Error('choose date button missing')
    }
    await user.click(chooseDate)
    const dialog = screen.getByRole('dialog', {
      name: /choose date, date of birth/i,
    })
    const dayButton = within(dialog)
      .getAllByRole('button')
      .find(
        (button): boolean =>
          /^\d{1,2}$/.test(button.textContent ?? '') &&
          button.getAttribute('aria-disabled') !== 'true' &&
          !button.hasAttribute('disabled'),
      )
    if (dayButton === undefined) {
      throw new Error('calendar day missing')
    }
    await user.click(dayButton)

    if (!(dob instanceof HTMLInputElement)) {
      throw new Error('date of birth control is not an input')
    }
    expect(dob.value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
