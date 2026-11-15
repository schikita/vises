import type { ReactElement } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { isPortalConditionalActive } from '../../utils/is-portal-conditional-active.util'
import { PortalFormToggleBanner } from '../PortalFormToggleBanner'
import { PortalThemedField } from '../PortalThemedField'

const FIELDS_ID = 'portal-other-residence-fields'

export const PortalOtherResidenceSection = (): ReactElement => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const hasOtherRaw = useWatch({
    control,
    name: 'portalFormConditionals.hasOtherResidenceship',
  })
  const hasOther = isPortalConditionalActive(hasOtherRaw)
  const banner = PORTAL_FORM_SECTION_BANNERS.otherResidence
  const fieldError = (path: string): string | undefined =>
    getNestedFormError(errors, path)

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-other-residence"
    >
      <div id="portal-section-other-residence">
        <Controller
          name="portalFormConditionals.hasOtherResidenceship"
          control={control}
          render={({ field }) => (
            <PortalFormToggleBanner
              number={banner.number}
              title={banner.title}
              checkboxId="portal-has-other-residence"
              controlsId={FIELDS_ID}
              name={field.name}
              checked={isPortalConditionalActive(field.value)}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.checked)}
              inputRef={field.ref}
            />
          )}
        />
      </div>
      {hasOther ? (
        <div className="portal-form-grid" id={FIELDS_ID}>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.otherResidenceshipPermitValidUntil}
            required
            error={fieldError(
              'portalFormConditionals.otherResidenceshipPermitValidUntil',
            )}
          >
            <input
              type="date"
              className="portal-form-control"
              {...register(
                'portalFormConditionals.otherResidenceshipPermitValidUntil',
              )}
            />
          </PortalThemedField>
        </div>
      ) : null}
    </section>
  )
}
