import type { KeyboardEvent } from 'react'
import { Btn } from '@/shared/ui'
import type { SettingsStringListEditorProps } from '../../types'

export const SettingsStringListEditor = ({
  label,
  values,
  draft,
  placeholder,
  addLabel,
  removeLabel,
  error,
  disabled = false,
  onDraftChange,
  onAdd,
  onRemove,
}: SettingsStringListEditorProps): React.ReactElement => {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (!disabled) onAdd()
  }

  const invalid = Boolean(error)

  return (
    <div className="block" data-invalid={invalid ? 'true' : undefined}>
      <span className="field-label">{label}</span>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={label}>
        {values.map(
          (value): React.ReactElement => (
            <li key={value}>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-control border border-border bg-accent-subtle px-2.5 py-1 text-xs font-medium text-text-primary transition-[border-color,color] hover:border-danger hover:text-danger disabled:opacity-40"
                aria-label={`${removeLabel}: ${value}`}
                disabled={disabled}
                onClick={(): void => {
                  onRemove(value)
                }}
              >
                {value}
                <span className="text-text-secondary" aria-hidden="true">
                  ×
                </span>
              </button>
            </li>
          ),
        )}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          className="field min-w-0 flex-1"
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e): void => {
            onDraftChange(e.target.value)
          }}
          onKeyDown={onKeyDown}
          aria-invalid={invalid ? true : undefined}
          aria-label={label}
        />
        <Btn type="button" variant="soft" disabled={disabled} onClick={onAdd}>
          {addLabel}
        </Btn>
      </div>
      {error ? (
        <span className="mt-1 block text-xs font-medium text-danger">
          {error}
        </span>
      ) : null}
    </div>
  )
}
