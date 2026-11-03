import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { ClientListSortIconProps } from '../../types/client-list-sort-icon.types'

export const ClientListSortIcon = ({
  active,
  dir,
}: ClientListSortIconProps): React.ReactElement => {
  if (!active) {
    return <ArrowUpDown size={12} className="opacity-40" />
  }
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}
