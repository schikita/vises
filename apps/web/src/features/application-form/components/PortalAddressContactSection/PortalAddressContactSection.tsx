import type { ReactElement } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  BELARUS_PHONE_COUNTRY_CODE,
  BELARUS_PHONE_COUNTRY_LABEL,
  BELARUS_PHONE_PLACEHOLDER,
} from '../../constants/belarus-phone.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { formatBelarusLocalPhoneDisplay } from '../../utils/format-belarus-local-phone-display.util'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { parseBelarusLocalPhoneDigits } from '../../utils/parse-belarus-local-phone-digits.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalAddressContactSection = (): ReactElement => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)
  const banner = PORTAL_FORM_SECTION_BANNERS.addressContact
  const latin = (path: keyof PortalOnePageFormValues): ReturnType<
    typeof registerLatinUppercaseField<PortalOnePageFormValues>
  > => registerLatinUppercaseField(register, setValue, path)

  return (
    <section className="portal-form-section" aria-labelledby="portal-section-address">
      <div id="portal-section-address">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <div className="portal-form-grid">
        <PortalThemedField
          label={PORTAL_FORM_LABELS.homeAddressLine1}
          required
          error={fieldError('address')}
        >
          <input className="portal-form-control uppercase" {...latin('address')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.homeAddressLine2}
          error={fieldError('homeAddressLine2')}
        >
          <input className="portal-form-control uppercase" {...latin('homeAddressLine2')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.country}
          required
          error={fieldError('homeCountry')}
        >
          <input className="portal-form-control uppercase" {...latin('homeCountry')} />
        </PortalThemedField>
        <PortalThemedField label={PORTAL_FORM_LABELS.city} required error={fieldError('homeCity')}>
          <input className="portal-form-control uppercase" {...latin('homeCity')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.postalCode}
          required
          error={fieldError('homePostalCode')}
        >
          <input className="portal-form-control uppercase" {...latin('homePostalCode')} />
        </PortalThemedField>
        <PortalThemedField
          label={PORTAL_FORM_LABELS.contactNumber}
          required
          error={fieldError('phone')}
        >
          <div className="portal-form-phone">
            <span className="portal-form-phone-prefix" aria-hidden="true">
              <span className="portal-form-phone-flag">{BELARUS_PHONE_COUNTRY_LABEL}</span>
              {BELARUS_PHONE_COUNTRY_CODE}
            </span>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  className="portal-form-control portal-form-phone-input"
                  placeholder={BELARUS_PHONE_PLACEHOLDER}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  value={formatBelarusLocalPhoneDisplay(
                    parseBelarusLocalPhoneDigits(String(field.value ?? '')),
                  )}
                  onChange={(e) =>
                    field.onChange(parseBelarusLocalPhoneDigits(e.target.value))
                  }
                />
              )}
            />
          </div>
        </PortalThemedField>
      </div>
    </section>
  )
}
