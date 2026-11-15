import type { ReactElement } from 'react'
import type { PortalFormSectionBannerProps } from '../../types/portal-form-section-banner.types'

export const PortalFormSectionBanner = ({
  number,
  title,
}: PortalFormSectionBannerProps): ReactElement => {
  const heading =
    number > 0 ? `${number}. ${title}` : title

  return (
    <div className="portal-form-section-banner" role="heading" aria-level={3}>
      {heading}
    </div>
  )
}
