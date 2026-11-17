import type { ReactElement } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { PaymentsSortIconProps } from './types'

export const PaymentsSortIcon = ({
  active,
  dir,
}: PaymentsSortIconProps): ReactElement => {
  const icon = !active ? (
    <ArrowUpDown size={12} className="opacity-40" />
  ) : dir === 'asc' ? (
    <ArrowUp size={12} />
  ) : (
    <ArrowDown size={12} />
  )

  return (
    <span
      className="inline-flex h-3 w-3 shrink-0 items-center justify-center"
      aria-hidden
    >
      {icon}
    </span>
  )
}
