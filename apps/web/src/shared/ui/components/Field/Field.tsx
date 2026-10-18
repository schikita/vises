import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

export const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) => {
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
        {required ? <span className="text-clay"> *</span> : null}
      </span>
      {control}
      {error ? <span className="mt-1 block text-xs font-semibold text-clay">{error}</span> : null}
    </label>
  )
}
