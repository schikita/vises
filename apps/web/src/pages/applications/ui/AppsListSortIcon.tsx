import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { AppsListSortIconProps } from '../types/apps-list-sort-icon.types'

export const AppsListSortIcon = ({
  active,
  dir,
}: AppsListSortIconProps): React.ReactElement => {
  if (!active) {
    return <ArrowUpDown size={12} className="opacity-40" />
  }
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}
