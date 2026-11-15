import type { ChangeEvent, ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { PASSPORT_ISSUE_COUNTRIES } from '../../constants/passport-issue-countries.constants'
import { PASSPORT_TYPES } from '../../constants/passport-types.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { syncIntendedArrivalWithTravelDate } from '../../utils/sync-intended-arrival-with-travel-date.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalPassportDetailsSection = (): ReactElement => {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)
  const banner = PORTAL_FORM_SECTION_BANNERS.passportDetails
  const latin = (path: keyof PortalOnePageFormValues): ReturnType<
    typeof registerLatinUppercaseField<PortalOnePageFormValues>
  > => registerLatinUppercaseField(register, setValue, path)

  const onTravelDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const travelDate = e.target.value
    const synced = syncIntendedArrivalWithTravelDate(
      travelDate,
      getValues('intendedArrivalDate'),
      'travelDate',
    )
    setValue('travelDate', synced.travelDate, { shouldDirty: true, shouldValidate: true })
    setValue('intendedArrivalDate', synced.intendedArrivalDate, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const onIntendedArrivalChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const intendedArrivalDate = e.target.value
    const synced = syncIntendedArrivalWithTravelDate(
      getValues('travelDate'),
      intendedArrivalDate,
      'intendedArrivalDate',
    )
    setValue('travelDate', synced.travelDate, { shouldDirty: true, shouldValidate: true })
    setValue('intendedArrivalDate', synced.intendedArrivalDate, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <section className="portal-form-section" aria-labelledby="portal-section-passport">
      <div id="portal-section-passport">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.nationalIdentityNumber}
          error={fieldError('nationalId')}
        >
          <input className="portal-form-control uppercase" {...latin('nationalId')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.passportType}
          required
          error={fieldError('passportType')}
        >
          <select className="portal-form-control" {...register('passportType')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {PASSPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.passportNo}
          required
          error={fieldError('passportNumber')}
        >
          <input className="portal-form-control uppercase" {...latin('passportNumber')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.issueDate}
          required
          error={fieldError('passportIssued')}
        >
          <input type="date" className="portal-form-control" {...register('passportIssued')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.expiryDate}
          required
          error={fieldError('passportExpires')}
        >
          <input type="date" className="portal-form-control" {...register('passportExpires')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.issuePlace}
          required
          error={fieldError('passportIssuedBy')}
        >
          <input className="portal-form-control uppercase" {...latin('passportIssuedBy')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.issueCountry}
          required
          error={fieldError('passportIssueCountry')}
        >
          <select className="portal-form-control" {...register('passportIssueCountry')}>
            <option value="">{PORTAL_FORM_LABELS.selectPlaceholder}</option>
            {PASSPORT_ISSUE_COUNTRIES.map((country, index) => (
              <option key={`${country}-${index}`} value={country}>
                {country}
              </option>
            ))}
          </select>
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.travelDate}
          required
          error={fieldError('travelDate')}
          hint={PORTAL_FORM_LABELS.travelArrivalSyncNote}
        >
          <input
            type="date"
            className="portal-form-control"
            {...register('travelDate')}
            onChange={onTravelDateChange}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.intendedDateOfArrival}
          required
          error={fieldError('intendedArrivalDate')}
        >
          <input
            type="date"
            className="portal-form-control"
            {...register('intendedArrivalDate')}
            onChange={onIntendedArrivalChange}
          />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.intendedDateOfDeparture}
          required
          error={fieldError('returnDate')}
        >
          <input type="date" className="portal-form-control" {...register('returnDate')} />
        </PortalThemedField>
      </div>
    </section>
  )
}
