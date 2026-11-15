import type { ChangeEvent } from 'react'
import { Field } from '@/shared/ui'
import type { PortalFormTextFieldProps } from '../types'
import { toUppercaseInputValue } from '../utils'

export const PortalFormTextField = ({
  name,
  label,
  required,
  pending,
  register,
  errors,
  uppercase = true,
}: PortalFormTextFieldProps): React.ReactElement => {
  const registration = register(name)
  const errorMessage = errors[name]?.message

  return (
    <Field label={label} required={required} error={errorMessage}>
      <input
        className={uppercase ? 'field uppercase' : 'field'}
        autoComplete="off"
        disabled={pending}
        aria-invalid={Boolean(errors[name])}
        {...registration}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
          if (uppercase) {
            event.target.value = toUppercaseInputValue(event.target.value)
          }
          void registration.onChange(event)
        }}
      />
    </Field>
  )
}
