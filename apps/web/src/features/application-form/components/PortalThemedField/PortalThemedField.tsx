import {
  cloneElement,
  isValidElement,
  type ReactElement,
} from 'react'
import type { PortalThemedFieldProps } from '../../types/portal-themed-field.types'

export const PortalThemedField = ({
  label,
  required,
  error,
  children,
  hint,
}: PortalThemedFieldProps): ReactElement => {
  const invalid = Boolean(error)
  const control =
    isValidElement(children) && invalid
      ? cloneElement(children as ReactElement<{ 'aria-invalid'?: boolean }>, {
          'aria-invalid': true,
        })
      : children

  return (
    <label className="portal-form-field block" data-invalid={invalid ? 'true' : undefined}>
      <span className="portal-form-field-label">
        {label}
        {required ? (
          <span className="portal-form-required" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </span>
      {control}
      {hint ? <span className="portal-form-field-hint">{hint}</span> : null}
      {error ? <span className="portal-form-field-error">{error}</span> : null}
    </label>
  )
}
