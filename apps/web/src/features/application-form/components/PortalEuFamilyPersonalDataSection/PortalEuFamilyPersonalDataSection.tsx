import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalEuFamilyPersonalDataSection = (): ReactElement => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const banner = PORTAL_FORM_SECTION_BANNERS.euFamilyPersonalData
  const fieldError = (path: string): string | undefined =>
    getNestedFormError(errors, path)
  const latin = (
    path:
      | 'portalFormConditionals.otherCitizenSurname'
      | 'portalFormConditionals.otherCitizenFirstName'
      | 'portalFormConditionals.otherCitizenNationality'
      | 'portalFormConditionals.otherCitizenDocumentNumber',
  ): ReturnType<typeof registerLatinUppercaseField<PortalOnePageFormValues>> =>
    registerLatinUppercaseField(register, setValue, path)

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-eu-family-personal"
    >
      <div id="portal-section-eu-family-personal">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.otherCitizenSurname}
          error={fieldError('portalFormConditionals.otherCitizenSurname')}
        >
          <input
            className="portal-form-control uppercase"
            {...latin('portalFormConditionals.otherCitizenSurname')}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.otherCitizenFirstName}
          error={fieldError('portalFormConditionals.otherCitizenFirstName')}
        >
          <input
            className="portal-form-control uppercase"
            {...latin('portalFormConditionals.otherCitizenFirstName')}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.otherCitizenDateOfBirth}
          error={fieldError('portalFormConditionals.otherCitizenDateOfBirth')}
        >
          <input
            type="date"
            className="portal-form-control"
            {...register('portalFormConditionals.otherCitizenDateOfBirth')}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.otherCitizenNationality}
          error={fieldError('portalFormConditionals.otherCitizenNationality')}
        >
          <input
            className="portal-form-control uppercase"
            {...latin('portalFormConditionals.otherCitizenNationality')}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.otherCitizenDocumentNumber}
          error={fieldError('portalFormConditionals.otherCitizenDocumentNumber')}
        >
          <input
            className="portal-form-control uppercase"
            {...latin('portalFormConditionals.otherCitizenDocumentNumber')}
          />
        </PortalThemedField>
      </div>
    </section>
  )
}
