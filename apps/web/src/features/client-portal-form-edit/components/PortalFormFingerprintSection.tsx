import type { ChangeEvent } from 'react'
import {
  PORTAL_FORM_FINGERPRINT_STATUS_OPTIONS,
} from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormFingerprintSectionProps } from '../types'
import {
  isFingerprintDateVisible,
  isPortalFormFieldRequired,
} from '../utils'
import { PortalFormControl } from './PortalFormControl'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'

export const PortalFormFingerprintSection = ({
  register,
  errors,
  setValue,
  watch,
  pending,
  statusValue,
}: PortalFormFingerprintSectionProps): React.ReactElement => {
  const { fieldLabel, fingerprintStatusLabel, sectionLabel } =
    usePortalFormLabels()
  const title = sectionLabel('fingerprint')
  const showDate = isFingerprintDateVisible(statusValue)

  return (
    <section
      className="space-y-3"
      aria-labelledby="portal-form-fingerprint-heading"
    >
      <PortalFormSectionHeader title={title} />
      <h2 id="portal-form-fingerprint-heading" className="sr-only">
        {title}
      </h2>
      <fieldset className="space-y-2">
        <legend className="field-label">
          {fieldLabel('previousFingerPrintStatus')}
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
              <span>{fingerprintStatusLabel(option.labelKey)}</span>
            </label>
          ),
        )}
      </fieldset>
      {showDate ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PortalFormControl
            name="previousFingerPrintDate"
            label={fieldLabel('previousFingerPrintDate')}
            required={isPortalFormFieldRequired('previousFingerPrintDate')}
            pending={pending}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </div>
      ) : null}
    </section>
  )
}
