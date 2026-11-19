import { afterEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen, userEvent } from '@/shared/testing'
import {
  PORTAL_FORM_ALL_FIELD_KEYS,
  PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS,
  PORTAL_FORM_INVITING_AUTHORITY_VALUE,
} from '../../constants'
import type { ClientPortalFormValues } from '../../types'
import { ClientPortalFormEditForm } from './ClientPortalFormEditForm'

const happyPathValues = (): ClientPortalFormValues => {
  const values = {} as ClientPortalFormValues
  for (const key of PORTAL_FORM_ALL_FIELD_KEYS) {
    if (key === 'blsInvitingAuthority') {
      values.blsInvitingAuthority = ''
      continue
    }
    values[key] = ''
  }
  for (const key of PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS) {
    if (key === 'blsInvitingAuthority') {
      values.blsInvitingAuthority = PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY
      continue
    }
    values[key] = 'X'
  }
  return values
}

describe('ClientPortalFormEditForm', (): void => {
  afterEach(async (): Promise<void> => {
    cleanup()
    await i18n.changeLanguage('en')
  })

  it('submits happy-path values via onValidSubmit (AC-FE-07)', async (): Promise<void> => {
    const defaultValues = happyPathValues()
    const onValidSubmit = vi.fn(async (): Promise<boolean> => true)
    const user = userEvent.setup()

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
        onValidSubmit={onValidSubmit}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /save portal form|сохранить/i }),
    )

    expect(onValidSubmit).toHaveBeenCalledTimes(1)
    expect(onValidSubmit).toHaveBeenCalledWith(defaultValues)
  })

  it('surfaces portalFormError on the form (AC-FE-07 smoke)', (): void => {
    render(
      <ClientPortalFormEditForm
        defaultValues={happyPathValues()}
        tripDisabled={false}
        tripDisabledMessage=""
        passportError=""
        portalFormError="portal boom"
        tripError=""
        saved={false}
        pending={false}
        onValidSubmit={vi.fn(async (): Promise<boolean> => false)}
      />,
    )

    expect(screen.getByRole('alert').textContent).toMatch(/portal boom/i)
  })

  it('renders section and field labels in Russian', async (): Promise<void> => {
    await i18n.changeLanguage('ru')

    render(
      <ClientPortalFormEditForm
        defaultValues={happyPathValues()}
        tripDisabled={false}
        tripDisabledMessage=""
        passportError=""
        portalFormError=""
        tripError=""
        saved={false}
        pending={false}
        onValidSubmit={vi.fn(async (): Promise<boolean> => false)}
      />,
    )

    expect(screen.getAllByText('1. Личные данные').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Имя').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Фамилия').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Отчество').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3. Паспортные данные').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('4. Адрес и контактные данные').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Место подачи и тип визы').length).toBeGreaterThan(
      0,
    )
  })
})
