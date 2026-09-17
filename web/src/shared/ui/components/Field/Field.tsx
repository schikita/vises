import type { ReactNode } from 'react'

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
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? <span className="text-clay"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-clay">{error}</span> : null}
    </label>
  )
}
