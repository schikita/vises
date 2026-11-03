import { Inbox } from 'lucide-react'
import type { DataTableEmptyProps } from './data-table-empty.types'

export const DataTableEmpty = (props: DataTableEmptyProps): React.ReactElement => {
  const { title, text } = props

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <Inbox
        aria-hidden="true"
        className="size-10 text-text-secondary/60"
        strokeWidth={1.5}
      />
      <p className="text-base font-semibold text-text-primary">{title}</p>
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  )
}
