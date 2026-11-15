import type { ReactElement } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  PREVIOUS_FINGERPRINT_STATUS_LABELS,
  PREVIOUS_FINGERPRINT_STATUS_VALUES,
} from '../../constants/fingerprint-statuses.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { isFingerprintDateRequired } from '../../utils/is-fingerprint-date-required.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalFingerprintsSection = (): ReactElement => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const status = useWatch({
    control,
    name: 'previousFingerPrintStatus',
  })
  const showDate = isFingerprintDateRequired(status)
  const banner = PORTAL_FORM_SECTION_BANNERS.fingerprints
  const dateError = getNestedFormError(errors, 'previousFingerPrintDate')

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-fingerprints"
    >
      <div id="portal-section-fingerprints">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <fieldset className="portal-form-radio-group">
        <legend className="sr-only">{banner.title}</legend>
        {PREVIOUS_FINGERPRINT_STATUS_VALUES.map((value) => (
          <label key={value} className="portal-form-radio-option">
            <input
              type="radio"
              value={value}
              {...register('previousFingerPrintStatus')}
            />
            <span>{PREVIOUS_FINGERPRINT_STATUS_LABELS[value]}</span>
          </label>
        ))}
      </fieldset>
      {showDate ? (
        <div className="portal-form-grid">
          <PortalThemedField
            label={PORTAL_FORM_LABELS.previousFingerPrintDate}
            required
            error={dateError}
          >
            <input
              type="date"
              className="portal-form-control"
              {...register('previousFingerPrintDate')}
            />
          </PortalThemedField>
        </div>
      ) : null}
    </section>
  )
}
