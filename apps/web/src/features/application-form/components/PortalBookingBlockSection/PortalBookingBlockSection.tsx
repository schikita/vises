import type { ChangeEvent, ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { CITIES_BY_COUNTRY } from '../../constants/cities-by-country.constants'
import { PORTAL_BOOKING_CATEGORIES } from '../../constants/portal-booking-categories.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import { PORTAL_VISA_SUB_TYPES } from '../../constants/portal-visa-sub-types.constants'
import { PORTAL_VISA_TYPES } from '../../constants/portal-visa-types.constants'
import { SUBMIT_COUNTRIES } from '../../constants/submit-countries.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalBookingBlockSection = (): ReactElement => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)
  const banner = PORTAL_FORM_SECTION_BANNERS.booking
  const submitCountry = watch('submitCountry')
  const cities = CITIES_BY_COUNTRY[submitCountry] ?? CITIES_BY_COUNTRY.Belarus ?? []

  const onSubmitCountryChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const country = e.target.value
    const nextCities = CITIES_BY_COUNTRY[country] ?? []
    setValue('submitCountry', country, { shouldDirty: true, shouldValidate: true })
    setValue('submitCity', nextCities[0] ?? '', { shouldDirty: true, shouldValidate: true })
  }

  return (
    <section className="portal-form-section" aria-labelledby="portal-section-booking">
      <div id="portal-section-booking">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.submitCountry}
          required
          error={fieldError('submitCountry')}
        >
          <select
            className="portal-form-control"
            {...register('submitCountry')}
            onChange={onSubmitCountryChange}
          >
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {SUBMIT_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.location}
          required
          error={fieldError('submitCity')}
        >
          <select className="portal-form-control" {...register('submitCity')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.visaType}
          required
          error={fieldError('visaType')}
        >
          <select className="portal-form-control" {...register('visaType')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {PORTAL_VISA_TYPES.map((visaType) => (
              <option key={visaType} value={visaType}>
                {visaType}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.visaSubType}
          required
          error={fieldError('visaSubType')}
        >
          <select className="portal-form-control" {...register('visaSubType')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {PORTAL_VISA_SUB_TYPES.map((subType) => (
              <option key={subType} value={subType}>
                {subType}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.category}
          required
          error={fieldError('category')}
        >
          <select className="portal-form-control" {...register('category')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {PORTAL_BOOKING_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </PortalThemedField>
      </div>
    </section>
  )
}
