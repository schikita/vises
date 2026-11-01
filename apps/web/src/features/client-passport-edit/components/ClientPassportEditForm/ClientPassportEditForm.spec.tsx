import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen } from '@/shared/testing'
import { CLIENT_PASSPORT_FORM_FIELDS } from '../../constants'
import type { ClientPassportFormValues } from '../../types'
import { ClientPassportEditForm } from './ClientPassportEditForm'

const emptyValues = (): ClientPassportFormValues => {
  const values = {} as ClientPassportFormValues
  for (const key of CLIENT_PASSPORT_FORM_FIELDS) {
    values[key] = ''
  }
  return values
}

describe('ClientPassportEditForm', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('surfaces passport_not_unlocked on submit failure (AC-8)', (): void => {
    const message = i18n.t(
      resolveApiErrorI18nKey({ detail: 'passport_not_unlocked' }),
    )

    render(
      <ClientPassportEditForm
        defaultValues={emptyValues()}
        apiError={message}
        saved={false}
        pending={false}
        onValidSubmit={vi.fn(async (): Promise<boolean> => false)}
      />,
    )

    expect(screen.getByRole('alert').textContent).toBe(message)
    expect(message.toLowerCase()).toMatch(/passport|паспорт/)
  })
})
