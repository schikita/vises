export type SettingsStringListEditorProps = {
  label: string
  values: string[]
  draft: string
  placeholder: string
  addLabel: string
  removeLabel: string
  error?: string
  onDraftChange: (value: string) => void
  onAdd: () => void
  onRemove: (value: string) => void
}
