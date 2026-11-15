import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { OCCUPATIONS } from '../../constants/occupations.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalEmployerDetailsSection = (): ReactElement => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)
  const banner = PORTAL_FORM_SECTION_BANNERS.employerDetails
  const latin = (path: keyof PortalOnePageFormValues): ReturnType<
    typeof registerLatinUppercaseField<PortalOnePageFormValues>
  > => registerLatinUppercaseField(register, setValue, path)

  return (
    <section className="portal-form-section" aria-labelledby="portal-section-employer">
      <div id="portal-section-employer">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.employerName}
          required
          error={fieldError('employerName')}
        >
          <input className="portal-form-control uppercase" {...latin('employerName')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.employerContactNumber}
          required
          error={fieldError('employerPhone')}
        >
          <input className="portal-form-control" {...register('employerPhone')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.employerAddress}
          required
          error={fieldError('employerAddress')}
        >
          <input className="portal-form-control uppercase" {...latin('employerAddress')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.occupation}
          required
          error={fieldError('occupation')}
        >
          <select className="portal-form-control" {...register('occupation')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {OCCUPATIONS.map((occupation) => (
              <option key={occupation} value={occupation}>
                {occupation}
              </option>
            ))}
          </select>
        </PortalThemedField>
      </div>
    </section>
  )
}
