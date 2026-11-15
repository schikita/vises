import type { ReactElement } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { isPortalConditionalActive } from '../../utils/is-portal-conditional-active.util'
import { PortalFormToggleBanner } from '../PortalFormToggleBanner'
import { PortalThemedField } from '../PortalThemedField'

const FIELDS_ID = 'portal-previous-visa-fields'

export const PortalPreviousSchengenVisaSection = (): ReactElement => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const issuedBeforeRaw = useWatch({
    control,
    name: 'portalFormConditionals.isVisaIssuedBefore',
  })
  const issuedBefore = isPortalConditionalActive(issuedBeforeRaw)
  const banner = PORTAL_FORM_SECTION_BANNERS.previousSchengenVisa
  const fieldError = (path: string): string | undefined =>
    getNestedFormError(errors, path)

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-previous-visa"
    >
      <div id="portal-section-previous-visa">
        <Controller
          name="portalFormConditionals.isVisaIssuedBefore"
          control={control}
          render={({ field }) => (
            <PortalFormToggleBanner
              number={banner.number}
              title={banner.title}
              checkboxId="portal-is-visa-issued-before"
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
      {issuedBefore ? (
        <div className="portal-form-grid" id={FIELDS_ID}>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.previousVisaValidFrom}
            required
            error={fieldError('portalFormConditionals.previousVisaValidFrom')}
          >
            <input
              type="date"
              className="portal-form-control"
              {...register('portalFormConditionals.previousVisaValidFrom')}
            />
          </PortalThemedField>
          <PortalThemedField
            label={PORTAL_FORM_LABELS.previousVisaValidTo}
            required
            error={fieldError('portalFormConditionals.previousVisaValidTo')}
          >
            <input
              type="date"
              className="portal-form-control"
              {...register('portalFormConditionals.previousVisaValidTo')}
            />
          </PortalThemedField>
        </div>
      ) : null}
    </section>
  )
}
