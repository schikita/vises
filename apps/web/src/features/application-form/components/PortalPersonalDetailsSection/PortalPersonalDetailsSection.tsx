import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { MARITAL_STATUSES } from '../../constants/marital-statuses.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalPersonalDetailsSection = (): ReactElement => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)
  const banner = PORTAL_FORM_SECTION_BANNERS.personalDetails
  const latin = (path: keyof PortalOnePageFormValues): ReturnType<
    typeof registerLatinUppercaseField<PortalOnePageFormValues>
  > => registerLatinUppercaseField(register, setValue, path)

  return (
    <section className="portal-form-section" aria-labelledby="portal-section-personal">
      <div id="portal-section-personal">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.firstName}
          required
          error={fieldError('firstName')}
        >
          <input className="portal-form-control uppercase" {...latin('firstName')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.surname}
          required
          error={fieldError('lastName')}
        >
          <input className="portal-form-control uppercase" {...latin('lastName')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.surnameAtBirth}
          required
          error={fieldError('lastNameAtBirth')}
        >
          <input className="portal-form-control uppercase" {...latin('lastNameAtBirth')} />
        </PortalThemedField>
        <PortalThemedField label={PORTAL_FORM_LABELS.lastName} error={fieldError('otherNames')}>
          <input className="portal-form-control uppercase" {...latin('otherNames')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.dateOfBirth}
          required
          error={fieldError('dob')}
        >
          <input type="date" className="portal-form-control" {...register('dob')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.placeOfBirth}
          required
          error={fieldError('placeOfBirth')}
        >
          <input className="portal-form-control uppercase" {...latin('placeOfBirth')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.countryOfBirth}
          required
          error={fieldError('countryOfBirth')}
        >
          <input className="portal-form-control uppercase" {...latin('countryOfBirth')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.currentNationality}
          required
          error={fieldError('nationality')}
        >
          <input className="portal-form-control uppercase" {...latin('nationality')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.nationalityAtBirth}
          error={fieldError('nationalityAtBirth')}
        >
          <input className="portal-form-control uppercase" {...latin('nationalityAtBirth')} />
        </PortalThemedField>
        <PortalThemedField label={PORTAL_FORM_LABELS.gender} required error={fieldError('gender')}>
          <select className="portal-form-control" {...register('gender')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            <option value="female">{PORTAL_FORM_LABELS.genderFemale}</option>
            <option value="male">{PORTAL_FORM_LABELS.genderMale}</option>
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.maritalStatus}
          required
          error={fieldError('maritalStatus')}
        >
          <select className="portal-form-control" {...register('maritalStatus')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {MARITAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </PortalThemedField>
      </div>
    </section>
  )
}
