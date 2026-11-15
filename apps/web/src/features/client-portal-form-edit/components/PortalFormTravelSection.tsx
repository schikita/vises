import {
  PORTAL_FORM_FIELD_LABELS,
  PORTAL_FORM_SECTION_LABELS,
  PORTAL_FORM_TRAVEL_FIELD_KEYS,
} from '../constants'
import type { PortalFormSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormTravelSection = ({
  register,
  errors,
  pending,
}: PortalFormSectionProps): React.ReactElement => (
  <section className="space-y-3" aria-labelledby="portal-form-travel-heading">
    <PortalFormSectionHeader title={PORTAL_FORM_SECTION_LABELS.travel} />
    <h2 id="portal-form-travel-heading" className="sr-only">
      {PORTAL_FORM_SECTION_LABELS.travel}
    </h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PORTAL_FORM_TRAVEL_FIELD_KEYS.map(
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
  </section>
)
