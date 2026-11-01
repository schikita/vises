import { CARD_BASE_CLASS } from './card.constants'
import type { CardProps } from './card.types'

export const Card = (props: CardProps): React.ReactElement => {
  const { children, className = '' } = props
  return <div className={`${CARD_BASE_CLASS} ${className}`.trim()}>{children}</div>
}
