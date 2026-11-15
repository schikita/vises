import type { ChangeEvent } from 'react'
import {
  PORTAL_FORM_FIELD_LABELS,
  PORTAL_FORM_FINGERPRINT_STATUS_OPTIONS,
  PORTAL_FORM_SECTION_LABELS,
} from '../constants'
import type { PortalFormFingerprintSectionProps } from '../types'
import {
  isFingerprintDateVisible,
  isPortalFormFieldRequired,
} from '../utils'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormFingerprintSection = ({
  register,
  errors,
  setValue,
  pending,
  statusValue,
}: PortalFormFingerprintSectionProps): React.ReactElement => {
  const showDate = isFingerprintDateVisible(statusValue)

  return (
    <section
      className="space-y-3"
      aria-labelledby="portal-form-fingerprint-heading"
    >
      <PortalFormSectionHeader title={PORTAL_FORM_SECTION_LABELS.fingerprint} />
      <h2 id="portal-form-fingerprint-heading" className="sr-only">
        {PORTAL_FORM_SECTION_LABELS.fingerprint}
      </h2>
      <fieldset className="space-y-2">
        <legend className="field-label">
          {PORTAL_FORM_FIELD_LABELS.previousFingerPrintStatus}
        </legend>
        {PORTAL_FORM_FINGERPRINT_STATUS_OPTIONS.map(
          (option): React.ReactElement => (
            <label
              key={option.value}
              className="flex items-start gap-2 text-sm text-text-primary"
            >
              <input
                type="radio"
                name="previousFingerPrintStatus"
                value={option.value}
                checked={statusValue === option.value}
                disabled={pending}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  setValue('previousFingerPrintStatus', event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              />
              <span>{option.label}</span>
            </label>
          ),
        )}
      </fieldset>
      {showDate ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PortalFormTextField
            name="previousFingerPrintDate"
            label={PORTAL_FORM_FIELD_LABELS.previousFingerPrintDate}
            required={isPortalFormFieldRequired('previousFingerPrintDate')}
            pending={pending}
            register={register}
            errors={errors}
          />
        </div>
      ) : null}
    </section>
  )
}
