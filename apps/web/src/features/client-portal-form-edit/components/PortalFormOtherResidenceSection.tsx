import type { ChangeEvent } from 'react'
import { PORTAL_FORM_SECTION_SURFACE_CLASS } from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormConditionalSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormControl } from './PortalFormControl'

export const PortalFormOtherResidenceSection = ({
  register,
  errors,
  setValue,
  watch,
  pending,
  enabled,
}: PortalFormConditionalSectionProps): React.ReactElement => {
  const { fieldLabel, sectionLabel } = usePortalFormLabels()

  return (
    <section
      className="space-y-3"
      aria-labelledby="portal-form-other-residence-heading"
    >
      <div
        className={`flex items-start gap-2 px-3 py-2 ${PORTAL_FORM_SECTION_SURFACE_CLASS}`}
      >
        <input
          id="portal-form-has-other-residenceship"
          type="checkbox"
          className="mt-1"
          checked={enabled}
          disabled={pending}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            setValue(
              'hasOtherResidenceship',
              event.target.checked ? 'true' : 'false',
              { shouldDirty: true, shouldValidate: true },
            )
          }}
        />
        <label
          htmlFor="portal-form-has-other-residenceship"
          id="portal-form-other-residence-heading"
          className="text-sm font-medium"
        >
          {sectionLabel('otherResidence')}
        </label>
      </div>
      {enabled ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PortalFormControl
            name="otherResidenceshipPermitValidUntil"
            label={fieldLabel('otherResidenceshipPermitValidUntil')}
            required={isPortalFormFieldRequired(
              'otherResidenceshipPermitValidUntil',
            )}
            pending={pending}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </div>
      ) : null}
    </section>
  )
}
