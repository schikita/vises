import {
  PORTAL_FORM_FIELD_LABELS,
  PORTAL_FORM_SECTION_LABELS,
  PORTAL_FORM_TRIP_FIELD_KEYS,
} from '../constants'
import type { PortalFormTripSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormTripSection = ({
  register,
  errors,
  pending,
  tripDisabled,
  tripDisabledMessage,
}: PortalFormTripSectionProps): React.ReactElement => {
  const fieldsDisabled = pending || tripDisabled

  return (
    <section className="space-y-3" aria-labelledby="portal-form-trip-heading">
      <PortalFormSectionHeader title={PORTAL_FORM_SECTION_LABELS.trip} />
      <h2 id="portal-form-trip-heading" className="sr-only">
        {PORTAL_FORM_SECTION_LABELS.trip}
      </h2>
      {tripDisabled ? (
        <p className="text-sm text-text-secondary" role="status">
          {tripDisabledMessage}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAL_FORM_TRIP_FIELD_KEYS.map(
          (field): React.ReactElement => (
            <PortalFormTextField
              key={field}
              name={field}
              label={PORTAL_FORM_FIELD_LABELS[field]}
              required={isPortalFormFieldRequired(field)}
              pending={fieldsDisabled}
              register={register}
              errors={errors}
            />
          ),
        )}
      </div>
    </section>
  )
}
