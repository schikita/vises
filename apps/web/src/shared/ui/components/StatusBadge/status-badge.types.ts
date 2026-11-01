export type StatusBadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'

export type StatusBadgeProps = {
  status: string
  label: string
}
