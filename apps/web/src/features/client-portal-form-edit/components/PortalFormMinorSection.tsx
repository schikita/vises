import type { ChangeEvent } from 'react'
import {
  PORTAL_FORM_FIELD_LABELS,
  PORTAL_FORM_MINOR_FIELD_KEYS,
  PORTAL_FORM_SECTION_LABELS,
} from '../constants'
import type { PortalFormConditionalSectionProps } from '../types'
import { isPortalFormFieldRequired } from '../utils'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormMinorSection = ({
  register,
  errors,
  setValue,
  pending,
  enabled,
}: PortalFormConditionalSectionProps): React.ReactElement => (
  <section className="space-y-3" aria-labelledby="portal-form-minor-heading">
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
      <input
        id="portal-form-is-minor"
        type="checkbox"
        className="mt-1"
        checked={enabled}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
          setValue('isMinor', event.target.checked ? 'true' : 'false', {
            shouldDirty: true,
            shouldValidate: true,
          })
        }}
      />
      <label
        htmlFor="portal-form-is-minor"
        id="portal-form-minor-heading"
        className="text-sm font-medium text-text-primary"
      >
        {PORTAL_FORM_SECTION_LABELS.minor}
      </label>
    </div>
    {enabled ? (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAL_FORM_MINOR_FIELD_KEYS.map(
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
    ) : null}
  </section>
)
