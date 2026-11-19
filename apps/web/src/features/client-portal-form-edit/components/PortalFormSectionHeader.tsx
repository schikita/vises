import { PORTAL_FORM_SECTION_SURFACE_CLASS } from '../constants'
import type { PortalFormSectionHeaderProps } from '../types'

export const PortalFormSectionHeader = ({
  title,
}: PortalFormSectionHeaderProps): React.ReactElement => (
  <div
    className={`${PORTAL_FORM_SECTION_SURFACE_CLASS} px-3 py-2 text-sm font-medium`}
  >
    {title}
  </div>
)
