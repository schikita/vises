import type { ChangeEvent } from 'react'
import {
  PORTAL_FORM_INVITING_AUTHORITY_OPTIONS,
  PORTAL_FORM_INVITING_AUTHORITY_VALUE,
  PORTAL_FORM_INVITING_COMPANY_FIELD_KEYS,
  PORTAL_FORM_INVITING_CONTACT_FIELD_KEYS,
} from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormInvitingSectionProps } from '../types'
import {
  isPortalFormFieldRequired,
  toInvitingAuthorityFormValue,
} from '../utils'
import { PortalFormControl } from './PortalFormControl'
import { PortalFormSectionHeader } from './PortalFormSectionHeader'

export const PortalFormInvitingSection = ({
  register,
  errors,
  setValue,
  watch,
  pending,
  authorityValue,
}: PortalFormInvitingSectionProps): React.ReactElement => {
  const {
    fieldLabel,
    invitingAuthorityLabel,
    issueMessage,
    sectionLabel,
  } = usePortalFormLabels()
  const title = sectionLabel('inviting')
  const showCompany =
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY ||
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.HOTEL
  const showContact =
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY ||
    authorityValue === PORTAL_FORM_INVITING_AUTHORITY_VALUE.PERSON
  const authorityError = issueMessage(errors.blsInvitingAuthority?.message)

  return (
    <section
      className="space-y-3"
      aria-labelledby="portal-form-inviting-heading"
    >
      <PortalFormSectionHeader title={title} />
      <h2 id="portal-form-inviting-heading" className="sr-only">
        {title}
      </h2>
      <fieldset className="space-y-2">
        <legend className="field-label">
          {fieldLabel('blsInvitingAuthority')}
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
              <span>{invitingAuthorityLabel(option.labelKey)}</span>
            </label>
          ),
        )}
        {authorityError ? (
          <p className="text-xs font-medium text-danger" role="alert">
            {authorityError}
          </p>
        ) : null}
      </fieldset>
      {showCompany ? (
        <div className="space-y-3">
          <h3 className="text-center text-sm font-semibold text-text-primary">
            {sectionLabel('invitingCompany')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PORTAL_FORM_INVITING_COMPANY_FIELD_KEYS.map(
              (field): React.ReactElement => (
                <PortalFormControl
                  key={field}
                  name={field}
                  label={fieldLabel(field)}
                  required={isPortalFormFieldRequired(field)}
                  pending={pending}
                  register={register}
                  setValue={setValue}
                  watch={watch}
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
            {sectionLabel('invitingContact')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PORTAL_FORM_INVITING_CONTACT_FIELD_KEYS.map(
              (field): React.ReactElement => (
                <PortalFormControl
                  key={field}
                  name={field}
                  label={fieldLabel(field)}
                  required={isPortalFormFieldRequired(field)}
                  pending={pending}
                  register={register}
                  setValue={setValue}
                  watch={watch}
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
