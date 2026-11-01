import { Card } from '@/shared/ui'
import type { BalanceAmountCardProps } from '../../types'

/** Displays a money decimal string as returned by the API (no float re-round). */
export const BalanceAmountCard = ({
  title,
  amount,
  hint,
}: BalanceAmountCardProps): React.ReactElement => {
  return (
    <Card className="space-y-1">
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-semibold tracking-tight text-text-primary" data-testid="balance-amount">
        {amount}
      </p>
      {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}
    </Card>
  )
}
