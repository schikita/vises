import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { UsersListSortIconProps } from './types'

export const UsersListSortIcon = ({
  active,
  dir,
}: UsersListSortIconProps): React.ReactElement => {
  if (!active) {
    return <ArrowUpDown size={12} className="opacity-40" />
  }
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}
