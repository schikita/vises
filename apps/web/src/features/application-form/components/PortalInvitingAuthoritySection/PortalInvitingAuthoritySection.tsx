import type { ReactElement } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  BLS_INVITING_AUTHORITY_LABELS,
  BLS_INVITING_AUTHORITY_VALUES,
} from '../../constants/inviting-authority.constants'
import { PORTAL_FORM_LABELS } from '../../constants/portal-form-labels.constants'
import { PORTAL_FORM_SECTION_BANNERS } from '../../constants/portal-form-section-banners.constants'
import type { PortalOnePageFormValues } from '../../types/portal-one-page-form.types'
import { getNestedFormError } from '../../utils/get-nested-form-error.util'
import { isInvitingAuthBlockRequired } from '../../utils/is-inviting-auth-block-required.util'
import { isInvitingContactBlockRequired } from '../../utils/is-inviting-contact-block-required.util'
import { registerLatinUppercaseField } from '../../utils/register-latin-uppercase-field.util'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'
import { PortalThemedField } from '../PortalThemedField'

export const PortalInvitingAuthoritySection = (): ReactElement => {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<PortalOnePageFormValues>()

  const authority = useWatch({
    control,
    name: 'blsInvitingAuthority',
  })
  const showAuth = isInvitingAuthBlockRequired(authority)
  const showContact = isInvitingContactBlockRequired(authority)
  const banner = PORTAL_FORM_SECTION_BANNERS.inviting
  const fieldError = (key: keyof PortalOnePageFormValues): string | undefined =>
    getNestedFormError(errors, key)
  const latin = (
    path: keyof PortalOnePageFormValues,
  ): ReturnType<typeof registerLatinUppercaseField<PortalOnePageFormValues>> =>
    registerLatinUppercaseField(register, setValue, path)

  return (
    <section
      className="portal-form-section"
      aria-labelledby="portal-section-inviting"
    >
      <div id="portal-section-inviting">
        <PortalFormSectionBanner number={banner.number} title={banner.title} />
      </div>
      <fieldset className="portal-form-radio-group">
        <legend className="sr-only">{banner.title}</legend>
        {BLS_INVITING_AUTHORITY_VALUES.map((value) => (
          <label key={value} className="portal-form-radio-option">
            <input
              type="radio"
              value={value}
              {...register('blsInvitingAuthority')}
            />
            <span>{BLS_INVITING_AUTHORITY_LABELS[value]}</span>
          </label>
        ))}
      </fieldset>
      {showAuth ? (
        <div className="portal-form-inviting-block" id="portal-inviting-auth">
          <h4 className="portal-form-subsection-title">
            {PORTAL_FORM_LABELS.invitingAuthBlockTitle}
          </h4>
          <div className="portal-form-grid">
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingAuthorityName}
              required
              error={fieldError('invitingAuthorityName')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingAuthorityName')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingCountry}
              required
              error={fieldError('invitingCountry')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingCountry')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingCity}
              required
              error={fieldError('invitingCity')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingCity')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingZipCode}
              required
              error={fieldError('invitingZipCode')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingZipCode')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingAddress}
              required
              error={fieldError('invitingAddress')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingAddress')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingEmail}
              required
              error={fieldError('invitingEmail')}
            >
              <input
                type="email"
                className="portal-form-control"
                {...register('invitingEmail')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactNo}
              required
              error={fieldError('invitingContactNo')}
            >
              <input
                className="portal-form-control"
                {...register('invitingContactNo')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingFaxNo}
              error={fieldError('invitingFaxNo')}
            >
              <input
                className="portal-form-control"
                {...register('invitingFaxNo')}
              />
            </PortalThemedField>
          </div>
        </div>
      ) : null}
      {showContact ? (
        <div className="portal-form-inviting-block" id="portal-inviting-contact">
          <h4 className="portal-form-subsection-title">
            {PORTAL_FORM_LABELS.invitingContactBlockTitle}
          </h4>
          <div className="portal-form-grid">
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactName}
              required
              error={fieldError('invitingContactName')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingContactName')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactSurname}
              required
              error={fieldError('invitingContactSurname')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingContactSurname')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactCountry}
              required
              error={fieldError('invitingContactCountry')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingContactCountry')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactCity}
              required
              error={fieldError('invitingContactCity')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingContactCity')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactZipCode}
              required
              error={fieldError('invitingContactZipCode')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingContactZipCode')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactAddress}
              required
              error={fieldError('invitingContactAddress')}
            >
              <input
                className="portal-form-control uppercase"
                {...latin('invitingContactAddress')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactContactNo}
              required
              error={fieldError('invitingContactContactNo')}
            >
              <input
                className="portal-form-control"
                {...register('invitingContactContactNo')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactEmail}
              required
              error={fieldError('invitingContactEmail')}
            >
              <input
                type="email"
                className="portal-form-control"
                {...register('invitingContactEmail')}
              />
            </PortalThemedField>
            <PortalThemedField
              label={PORTAL_FORM_LABELS.invitingContactFaxNo}
              error={fieldError('invitingContactFaxNo')}
            >
              <input
                className="portal-form-control"
                {...register('invitingContactFaxNo')}
              />
            </PortalThemedField>
          </div>
        </div>
      ) : null}
    </section>
  )
}
