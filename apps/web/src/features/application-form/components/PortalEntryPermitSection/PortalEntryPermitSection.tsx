import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalEntryPermitSection = (): ReactElement => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const banner = PORTAL_FORM_SECTION_BANNERS.entryPermit
  const fieldError = (path: string): string | undefined =>
    getNestedFormError(errors, path)
  const latinCountry = registerLatinUppercaseField(
    register,
    setValue,
    'portalFormConditionals.finalDestinationIssuedByCountry',
  )

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-entry-permit"
    >
      <div id="portal-section-entry-permit">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.finalDestinationIssuedByCountry}
          error={fieldError(
            'portalFormConditionals.finalDestinationIssuedByCountry',
          )}
        >
          <input className="portal-form-control uppercase" {...latinCountry} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.finalDestinationValidFromDate}
          error={fieldError(
            'portalFormConditionals.finalDestinationValidFromDate',
          )}
        >
          <input
            type="date"
            className="portal-form-control"
            {...register('portalFormConditionals.finalDestinationValidFromDate')}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.finalDestinationValidToDate}
          error={fieldError(
            'portalFormConditionals.finalDestinationValidToDate',
          )}
        >
          <input
            type="date"
            className="portal-form-control"
            {...register('portalFormConditionals.finalDestinationValidToDate')}
          />
        </PortalThemedField>
      </div>
    </section>
  )
}
