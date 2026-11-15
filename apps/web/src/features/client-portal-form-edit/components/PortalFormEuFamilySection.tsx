import {
  PORTAL_FORM_EU_FAMILY_CITIZEN_FIELD_KEYS,
  PORTAL_FORM_FIELD_LABELS,
  PORTAL_FORM_SECTION_LABELS,
} from '../constants'
import type { PortalFormSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormEuFamilySection = ({
  register,
  errors,
  pending,
}: PortalFormSectionProps): React.ReactElement => (
  <section className="space-y-6" aria-labelledby="portal-form-eu-family-heading">
    <div className="space-y-3">
      <PortalFormSectionHeader
        title={PORTAL_FORM_SECTION_LABELS.euFamilyCitizen}
      />
      <h2 id="portal-form-eu-family-heading" className="sr-only">
        {PORTAL_FORM_SECTION_LABELS.euFamilyCitizen}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAL_FORM_EU_FAMILY_CITIZEN_FIELD_KEYS.map(
          (field): React.ReactElement => (
            <PortalFormTextField
              key={field}
              name={field}
              label={PORTAL_FORM_FIELD_LABELS[field]}
              required={isPortalFormFieldRequired(field)}
              pending={pending}
              register={register}
              errors={errors}
            />
          ),
        )}
      </div>
    </div>
    <div className="space-y-3">
      <PortalFormSectionHeader
        title={PORTAL_FORM_SECTION_LABELS.euFamilyRelationship}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PortalFormTextField
          name="otherCitizenFamilyRelationship"
          label={PORTAL_FORM_FIELD_LABELS.otherCitizenFamilyRelationship}
          required={isPortalFormFieldRequired(
            'otherCitizenFamilyRelationship',
          )}
          pending={pending}
          register={register}
          errors={errors}
        />
      </div>
    </div>
  </section>
)
