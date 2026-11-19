import { PORTAL_FORM_TRIP_SECTION_FIELD_KEYS } from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormTripSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormControl } from './PortalFormControl'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'

export const PortalFormTripSection = ({
  register,
  errors,
  setValue,
  watch,
  pending,
  tripDisabled,
  tripDisabledMessage,
}: PortalFormTripSectionProps): React.ReactElement => {
  const { fieldLabel, sectionLabel } = usePortalFormLabels()
  const title = sectionLabel('trip')
  const fieldsDisabled = pending || tripDisabled

  return (
    <section className="space-y-3" aria-labelledby="portal-form-trip-heading">
      <PortalFormSectionHeader title={title} />
      <h2 id="portal-form-trip-heading" className="sr-only">
        {title}
      </h2>
      {tripDisabled ? (
        <p className="text-sm text-text-secondary" role="status">
          {tripDisabledMessage}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAL_FORM_TRIP_SECTION_FIELD_KEYS.map(
          (field): React.ReactElement => (
            <PortalFormControl
              key={field}
              name={field}
              label={fieldLabel(field)}
              required={isPortalFormFieldRequired(field)}
              pending={fieldsDisabled}
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
          ),
        )}
      </div>
    </section>
  )
}
