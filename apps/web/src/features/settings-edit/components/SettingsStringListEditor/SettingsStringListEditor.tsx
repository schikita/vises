import type { KeyboardEvent, ReactElement } from 'react'
import { Btn } from '@/shared/ui'
import type { SettingsStringListEditorProps } from '../../types/settings-string-list-editor.types'

export const SettingsStringListEditor = ({
  label,
  values,
  draft,
  placeholder,
  addLabel,
  removeLabel,
  error,
  onDraftChange,
  onAdd,
  onRemove,
}: SettingsStringListEditorProps): ReactElement => {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    onAdd()
  }

  const invalid = Boolean(error)

  return (
    <div className="block" data-invalid={invalid ? 'true' : undefined}>
      <span className="field-label">{label}</span>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={label}>
        {values.map((value) => (
          <li key={value}>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-line bg-[#f7f4ee] px-2.5 py-1 text-xs font-bold hover:border-clay hover:text-clay"
              aria-label={`${removeLabel}: ${value}`}
              onClick={() => onRemove(value)}
            >
              {value}
              <span className="text-muted" aria-hidden="true">
                ×
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          className="field min-w-0 flex-1"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
          aria-invalid={invalid ? true : undefined}
          aria-label={label}
        />
        <Btn type="button" variant="soft" onClick={onAdd}>
          {addLabel}
        </Btn>
      </div>
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-clay">{error}</span>
      ) : null}
    </div>
  )
}
