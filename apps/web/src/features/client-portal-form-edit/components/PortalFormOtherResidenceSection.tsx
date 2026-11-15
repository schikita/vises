import type { ChangeEvent } from 'react'
import {
  PORTAL_FORM_FIELD_LABELS,
  PORTAL_FORM_SECTION_LABELS,
} from '../constants'
import type { PortalFormConditionalSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormOtherResidenceSection = ({
  register,
  errors,
  setValue,
  pending,
  enabled,
}: PortalFormConditionalSectionProps): React.ReactElement => (
  <section
    className="space-y-3"
    aria-labelledby="portal-form-other-residence-heading"
  >
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
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
        className="text-sm font-medium text-text-primary"
      >
        {PORTAL_FORM_SECTION_LABELS.otherResidence}
      </label>
    </div>
    {enabled ? (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PortalFormTextField
          name="otherResidenceshipPermitValidUntil"
          label={PORTAL_FORM_FIELD_LABELS.otherResidenceshipPermitValidUntil}
          required={isPortalFormFieldRequired(
            'otherResidenceshipPermitValidUntil',
          )}
          pending={pending}
          register={register}
          errors={errors}
        />
      </div>
    ) : null}
  </section>
)
