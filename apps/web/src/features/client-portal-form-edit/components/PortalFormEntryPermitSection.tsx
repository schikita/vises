import { PORTAL_FORM_ENTRY_PERMIT_FIELD_KEYS } from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormControl } from './PortalFormControl'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'

export const PortalFormEntryPermitSection = ({
  register,
  errors,
  setValue,
  watch,
  pending,
}: PortalFormSectionProps): React.ReactElement => {
  const { fieldLabel, sectionLabel } = usePortalFormLabels()
  const title = sectionLabel('entryPermit')

  return (
    <section
      className="space-y-3"
      aria-labelledby="portal-form-entry-permit-heading"
    >
      <PortalFormSectionHeader title={title} />
      <h2 id="portal-form-entry-permit-heading" className="sr-only">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAL_FORM_ENTRY_PERMIT_FIELD_KEYS.map(
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
    </section>
  )
}
