import { cloneElement, isValidElement, type ReactElement } from 'react'
import type { FieldProps } from './field.types'

export const Field = (props: FieldProps): React.ReactElement => {
  const { label, required, error, children } = props
  const invalid = Boolean(error)
  const control =
    isValidElement(children) && invalid
      ? cloneElement(children as ReactElement<{ 'aria-invalid'?: boolean }>, {
          'aria-invalid': true,
        })
      : children

  return (
    <label className="block" data-invalid={invalid ? 'true' : undefined}>
      <span className="field-label">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {control}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-danger">{error}</span>
      ) : null}
    </label>
  )
}
