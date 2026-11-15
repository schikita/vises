import type { RefinementCtx } from 'zod'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import type { PortalInvitingRefineData } from '../types/portal-inviting-refine.types'
import { isInvitingAuthBlockRequired } from './is-inviting-auth-block-required.util'
import { isInvitingContactBlockRequired } from './is-inviting-contact-block-required.util'
import { isNonEmptyTrimmed } from './is-non-empty-trimmed.util'

const requireField = (
  ctx: RefinementCtx,
  path: keyof PortalInvitingRefineData,
  value: string,
  message: string,
): void => {
  if (!isNonEmptyTrimmed(value)) {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message,
    })
  }
}

/**
 * Branch-aware inviting requiredness (DEC-PF-006 / AC-04):
 * company → auth + contact; hotel → auth only; person → contact only;
 * inactive branch fields are not required.
 */
export const refinePortalInvitingAuthority = (
  data: PortalInvitingRefineData,
  ctx: RefinementCtx,
): void => {
  if (isInvitingAuthBlockRequired(data.blsInvitingAuthority)) {
    requireField(
      ctx,
      'invitingAuthorityName',
      data.invitingAuthorityName,
      APPLICATION_FORM_MESSAGES.invitingAuthorityNameRequired,
    )
    requireField(
      ctx,
      'invitingCountry',
      data.invitingCountry,
      APPLICATION_FORM_MESSAGES.invitingCountryRequired,
    )
    requireField(
      ctx,
      'invitingCity',
      data.invitingCity,
      APPLICATION_FORM_MESSAGES.invitingCityRequired,
    )
    requireField(
      ctx,
      'invitingZipCode',
      data.invitingZipCode,
      APPLICATION_FORM_MESSAGES.invitingZipCodeRequired,
    )
    requireField(
      ctx,
      'invitingAddress',
      data.invitingAddress,
      APPLICATION_FORM_MESSAGES.invitingAddressRequired,
    )
    requireField(
      ctx,
      'invitingEmail',
      data.invitingEmail,
      APPLICATION_FORM_MESSAGES.invitingEmailRequired,
    )
    requireField(
      ctx,
      'invitingContactNo',
      data.invitingContactNo,
      APPLICATION_FORM_MESSAGES.invitingContactNoRequired,
    )
  }

  if (isInvitingContactBlockRequired(data.blsInvitingAuthority)) {
    requireField(
      ctx,
      'invitingContactName',
      data.invitingContactName,
      APPLICATION_FORM_MESSAGES.invitingContactNameRequired,
    )
    requireField(
      ctx,
      'invitingContactSurname',
      data.invitingContactSurname,
      APPLICATION_FORM_MESSAGES.invitingContactSurnameRequired,
    )
    requireField(
      ctx,
      'invitingContactCountry',
      data.invitingContactCountry,
      APPLICATION_FORM_MESSAGES.invitingContactCountryRequired,
    )
    requireField(
      ctx,
      'invitingContactCity',
      data.invitingContactCity,
      APPLICATION_FORM_MESSAGES.invitingContactCityRequired,
    )
    requireField(
      ctx,
      'invitingContactZipCode',
      data.invitingContactZipCode,
      APPLICATION_FORM_MESSAGES.invitingContactZipCodeRequired,
    )
    requireField(
      ctx,
      'invitingContactAddress',
      data.invitingContactAddress,
      APPLICATION_FORM_MESSAGES.invitingContactAddressRequired,
    )
    requireField(
      ctx,
      'invitingContactContactNo',
      data.invitingContactContactNo,
      APPLICATION_FORM_MESSAGES.invitingContactContactNoRequired,
    )
    requireField(
      ctx,
      'invitingContactEmail',
      data.invitingContactEmail,
      APPLICATION_FORM_MESSAGES.invitingContactEmailRequired,
    )
  }
}
