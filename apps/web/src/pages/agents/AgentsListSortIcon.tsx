import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { AgentsListSortIconProps } from './types/agents-list-sort-icon.types'

export const AgentsListSortIcon = ({
  active,
  dir,
}: AgentsListSortIconProps): React.ReactElement => {
  if (!active) {
    return <ArrowUpDown size={12} className="opacity-40" />
  }
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}
