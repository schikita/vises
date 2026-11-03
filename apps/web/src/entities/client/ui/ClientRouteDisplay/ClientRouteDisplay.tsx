import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ClientRouteDisplayProps } from '../../types/client-route-display.types'

/** Route cell: From → To with arrow icon; both empty → em dash (DEC-P11). */
export const ClientRouteDisplay = ({
  routeFrom,
  routeTo,
}: ClientRouteDisplayProps): React.ReactElement => {
  const { t } = useTranslation()
  const from = routeFrom?.trim() ?? ''
  const to = routeTo?.trim() ?? ''

  if (!from && !to) {
    return <span className="text-text-secondary">{t('clients.list.routeEmpty')}</span>
  }

  return (
    <span className="inline-flex items-center gap-1 text-text-secondary">
      <span>{from || t('clients.list.routeEmpty')}</span>
      <ArrowRight size={14} className="shrink-0 text-text-secondary" aria-hidden />
      <span>{to || t('clients.list.routeEmpty')}</span>
    </span>
  )
}
