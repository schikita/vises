import type { ReactElement } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { VisitsSortIconProps } from './types'

export const VisitsSortIcon = ({ active, dir }: VisitsSortIconProps): ReactElement => {
  if (!active) return <ArrowUpDown size={12} className="opacity-40" />
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}
