import type { ChangeEvent } from 'react'
import {
  PORTAL_FORM_FIELD_LABELS,
  PORTAL_FORM_INVITING_AUTHORITY_OPTIONS,
  PORTAL_FORM_INVITING_AUTHORITY_VALUE,
  PORTAL_FORM_INVITING_COMPANY_FIELD_KEYS,
  PORTAL_FORM_INVITING_CONTACT_FIELD_KEYS,
  PORTAL_FORM_SECTION_LABELS,
} from '../constants'
import type { PortalFormInvitingSectionProps } from '../types'
import {
  isPortalFormFieldRequired,
  toInvitingAuthorityFormValue,
} from '../utils'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'
import { PortalFormTextField } from './PortalFormTextField'

export const PortalFormInvitingSection = ({
  register,
  errors,
  setValue,
  pending,
  authorityValue,
}: PortalFormInvitingSectionProps): React.ReactElement => {
  const showCompany =
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY ||
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.HOTEL
  const showContact =
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY ||
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.PERSON

  return (
    <section
      className="space-y-3"
      aria-labelledby="portal-form-inviting-heading"
    >
      <PortalFormSectionHeader title={PORTAL_FORM_SECTION_LABELS.inviting} />
      <h2 id="portal-form-inviting-heading" className="sr-only">
        {PORTAL_FORM_SECTION_LABELS.inviting}
      </h2>
      <fieldset className="space-y-2">
        <legend className="field-label">
          {PORTAL_FORM_FIELD_LABELS.blsInvitingAuthority}
          {isPortalFormFieldRequired('blsInvitingAuthority') ? (
            <span className="text-danger"> *</span>
          ) : null}
        </legend>
        {PORTAL_FORM_INVITING_AUTHORITY_OPTIONS.map(
          (option): React.ReactElement => (
            <label
              key={option.value}
              className="flex items-start gap-2 text-sm text-text-primary"
            >
              <input
                type="radio"
                name="blsInvitingAuthority"
                value={option.value}
                checked={authorityValue === option.value}
                disabled={pending}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  setValue(
                    'blsInvitingAuthority',
                    toInvitingAuthorityFormValue(event.target.value),
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }}
              />
              <span>{option.label}</span>
            </label>
          ),
        )}
        {errors.blsInvitingAuthority?.message ? (
          <p className="text-xs font-medium text-danger" role="alert">
            {errors.blsInvitingAuthority.message}
          </p>
        ) : null}
      </fieldset>
      {showCompany ? (
        <div className="space-y-3">
          <h3 className="text-center text-sm font-semibold text-text-primary">
            {PORTAL_FORM_SECTION_LABELS.invitingCompany}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PORTAL_FORM_INVITING_COMPANY_FIELD_KEYS.map(
              (field): React.ReactElement => (
                <PortalFormTextField
                  key={field}
                  name={field}
                  label={PORTAL_FORM_FIELD_LABELS[field]}
                  required={isPortalFormFieldRequired(field)}
                  pending={pending}
                  register={register}
                  errors={errors}
                />
              ),
            )}
          </div>
        </div>
      ) : null}
      {showContact ? (
        <div className="space-y-3">
          <h3 className="text-center text-sm font-semibold text-text-primary">
            {PORTAL_FORM_SECTION_LABELS.invitingContact}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PORTAL_FORM_INVITING_CONTACT_FIELD_KEYS.map(
              (field): React.ReactElement => (
                <PortalFormTextField
                  key={field}
                  name={field}
                  label={PORTAL_FORM_FIELD_LABELS[field]}
                  required={isPortalFormFieldRequired(field)}
                  pending={pending}
                  register={register}
                  errors={errors}
                />
              ),
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
