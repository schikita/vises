import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { EU_FAMILY_RELATIONSHIPS } from '../../constants/eu-family-relationships.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalEuFamilyRelationshipSection = (): ReactElement => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const banner = PORTAL_FORM_SECTION_BANNERS.euFamilyRelationship
  const relationshipError = getNestedFormError(
    errors,
    'portalFormConditionals.otherCitizenFamilyRelationship',
  )

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-eu-family-relationship"
    >
      <div id="portal-section-eu-family-relationship">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.otherCitizenFamilyRelationship}
          error={relationshipError}
        >
          <select
            className="portal-form-control"
            {...register(
              'portalFormConditionals.otherCitizenFamilyRelationship',
            )}
          >
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {EU_FAMILY_RELATIONSHIPS.map((relationship) => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
          </select>
        </PortalThemedField>
      </div>
    </section>
  )
}
