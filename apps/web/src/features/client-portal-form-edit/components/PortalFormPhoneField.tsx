import type { ChangeEvent } from 'react'
import { Field } from '@/shared/ui'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormPhoneFieldProps } from '../types'
import { digitsOnlyPhone } from '../utils'

export const PortalFormPhoneField = ({
  name,
  label,
  required,
  pending,
  register,
  errors,
}: PortalFormPhoneFieldProps): React.ReactElement => {
  const { issueMessage } = usePortalFormLabels()
  const registration = register(name)
  const errorMessage = issueMessage(errors[name]?.message)

  return (
    <Field label={label} required={required} error={errorMessage}>
      <input
        className="field"
        inputMode="numeric"
        autoComplete="off"
        disabled={pending}
        aria-invalid={Boolean(errors[name])}
        {...registration}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
          event.target.value = digitsOnlyPhone(event.target.value)
          void registration.onChange(event)
        }}
      />
    </Field>
  )
}
