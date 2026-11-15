import type { ReactElement } from 'react'
import type { PortalOnePageCoreSectionsProps } from '../../types/portal-one-page-core-sections.types'
import { PortalAddressContactSection } from '../PortalAddressContactSection'
import { PortalBookingBlockSection } from '../PortalBookingBlockSection'
import { PortalEmployerDetailsSection } from '../PortalEmployerDetailsSection'
import { PortalPassportDetailsSection } from '../PortalPassportDetailsSection'
import { PortalPersonalDetailsSection } from '../PortalPersonalDetailsSection'
import { PortalTravelInformationSection } from '../PortalTravelInformationSection'

/**
 * Core BLS Edit Member sections for PF-TASK-005a.
 * Conditional slots (afterPersonal / afterAddress / afterTravel) are for 005b.
 */
export const PortalOnePageCoreSections = ({
  afterPersonal,
  afterAddress,
  afterTravel,
}: PortalOnePageCoreSectionsProps): ReactElement => {
  return (
    <div className="portal-form-core-sections">
      <PortalPersonalDetailsSection />
      {afterPersonal}
      <PortalPassportDetailsSection />
      <PortalAddressContactSection />
      {afterAddress}
      <PortalEmployerDetailsSection />
      <PortalTravelInformationSection />
      {afterTravel}
      <PortalBookingBlockSection />
    </div>
  )
}
