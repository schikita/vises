import type { ReactElement } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { SortIconProps } from './types'

export const SortIcon = ({ active, dir }: SortIconProps): ReactElement => {
  const icon = !active ? (
    <ArrowUpDown size={12} className="opacity-40" />
  ) : dir === 'asc' ? (
    <ArrowUp size={12} />
  ) : (
    <ArrowDown size={12} />
  )

  return (
    <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center" aria-hidden>
      {icon}
    </span>
  )
}
