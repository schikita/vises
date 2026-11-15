import type { ReactElement } from 'react'
import type { PortalOnePageFormSectionsProps } from '../../types/portal-one-page-form-sections.types'
import { PortalCostOfTravellingSection } from '../PortalCostOfTravellingSection'
import { PortalEntryPermitSection } from '../PortalEntryPermitSection'
import { PortalEuFamilyPersonalDataSection } from '../PortalEuFamilyPersonalDataSection'
import { PortalEuFamilyRelationshipSection } from '../PortalEuFamilyRelationshipSection'
import { PortalFingerprintsSection } from '../PortalFingerprintsSection'
import { PortalFormShell } from '../PortalFormShell'
import { PortalInvitingAuthoritySection } from '../PortalInvitingAuthoritySection'
import { PortalMinorsSection } from '../PortalMinorsSection'
import { PortalOnePageCoreSections } from '../PortalOnePageCoreSections'
import { PortalOtherResidenceSection } from '../PortalOtherResidenceSection'
import { PortalPreviousSchengenVisaSection } from '../PortalPreviousSchengenVisaSection'

/**
 * Composes 005a core slots with 005b conditionals inside PortalFormShell.
 * Page wiring (staff create/detail) is PF-TASK-006.
 */
export const PortalOnePageFormSections = ({
  title,
}: PortalOnePageFormSectionsProps): ReactElement => {
  return (
    <PortalFormShell title={title}>
      <PortalOnePageCoreSections
        afterPersonal={<PortalMinorsSection />}
        afterAddress={<PortalOtherResidenceSection />}
        afterTravel={
          <>
            <PortalPreviousSchengenVisaSection />
            <PortalFingerprintsSection />
            <PortalEntryPermitSection />
            <PortalInvitingAuthoritySection />
            <PortalCostOfTravellingSection />
            <PortalEuFamilyPersonalDataSection />
            <PortalEuFamilyRelationshipSection />
          </>
        }
      />
    </PortalFormShell>
  )
}
