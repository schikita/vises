import { PORTAL_FORM_EU_FAMILY_CITIZEN_FIELD_KEYS } from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormControl } from './PortalFormControl'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'

export const PortalFormEuFamilySection = ({
  register,
  errors,
  setValue,
  watch,
  pending,
}: PortalFormSectionProps): React.ReactElement => {
  const { fieldLabel, sectionLabel } = usePortalFormLabels()
  const citizenTitle = sectionLabel('euFamilyCitizen')
  const relationshipTitle = sectionLabel('euFamilyRelationship')

  return (
    <section className="space-y-6" aria-labelledby="portal-form-eu-family-heading">
      <div className="space-y-3">
        <PortalFormSectionHeader title={citizenTitle} />
        <h2 id="portal-form-eu-family-heading" className="sr-only">
          {citizenTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PORTAL_FORM_EU_FAMILY_CITIZEN_FIELD_KEYS.map(
            (field): React.ReactElement => (
              <PortalFormControl
                key={field}
                name={field}
                label={fieldLabel(field)}
                required={isPortalFormFieldRequired(field)}
                pending={pending}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            ),
          )}
        </div>
      </div>
      <div className="space-y-3">
        <PortalFormSectionHeader title={relationshipTitle} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PortalFormControl
            name="otherCitizenFamilyRelationship"
            label={fieldLabel('otherCitizenFamilyRelationship')}
            required={isPortalFormFieldRequired(
              'otherCitizenFamilyRelationship',
            )}
            pending={pending}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </div>
      </div>
    </section>
  )
}
