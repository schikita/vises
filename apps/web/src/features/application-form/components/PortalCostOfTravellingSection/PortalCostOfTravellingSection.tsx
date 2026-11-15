import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { COST_COVERED_BY_OPTIONS } from '../../constants/cost-covered-by.constants'
import { MEANS_OF_SUPPORT_OPTIONS } from '../../constants/means-of-support.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalCostOfTravellingSection = (): ReactElement => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const banner = PORTAL_FORM_SECTION_BANNERS.costOfTravelling
  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-cost"
    >
      <div id="portal-section-cost">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.costCoveredBy}
          required
          error={fieldError('costCoveredBy')}
        >
          <select className="portal-form-control" {...register('costCoveredBy')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {COST_COVERED_BY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.meansOfSupport}
          required
          error={fieldError('meansOfSupport')}
        >
          <select
            className="portal-form-control"
            {...register('meansOfSupport')}
          >
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {MEANS_OF_SUPPORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </PortalThemedField>
      </div>
    </section>
  )
}
