import type { RefinementCtx } from 'zod'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import type { PortalConditionalsRefineData } from '../types/portal-conditionals-refine.types'
import { isNonEmptyTrimmed } from './is-non-empty-trimmed.util'
import { isPortalConditionalActive } from './is-portal-conditional-active.util'

const requireConditionalString = (
  ctx: RefinementCtx,
  path: (string | number)[],
  value: string | null | undefined,
  message: string,
): void => {
  if (!isNonEmptyTrimmed(value ?? undefined)) {
    ctx.addIssue({
      code: 'custom',
      path,
      message,
    })
  }
}

/**
 * First-class conditionals (DEC-PF-007 / AC-05):
 * active branch dependents required; inactive not required / no invented values.
 */
export const refinePortalConditionals = (
  data: PortalConditionalsRefineData,
  ctx: RefinementCtx,
): void => {
  const bag = data.portalFormConditionals

  if (isPortalConditionalActive(bag.isMinor)) {
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'minorParentSurname'],
      bag.minorParentSurname,
      APPLICATION_FORM_MESSAGES.minorParentSurnameRequired,
    )
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'minorParentFirstName'],
      bag.minorParentFirstName,
      APPLICATION_FORM_MESSAGES.minorParentFirstNameRequired,
    )
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'minorParentLastName'],
      bag.minorParentLastName,
      APPLICATION_FORM_MESSAGES.minorParentLastNameRequired,
    )
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'minorParentNationality'],
      bag.minorParentNationality,
      APPLICATION_FORM_MESSAGES.minorParentNationalityRequired,
    )
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'minorParentAddress'],
      bag.minorParentAddress,
      APPLICATION_FORM_MESSAGES.minorParentAddressRequired,
    )
  }

  if (isPortalConditionalActive(bag.hasOtherResidenceship)) {
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'otherResidenceshipPermitValidUntil'],
      bag.otherResidenceshipPermitValidUntil,
      APPLICATION_FORM_MESSAGES.otherResidenceshipPermitValidUntilRequired,
    )
  }

  if (isPortalConditionalActive(bag.isVisaIssuedBefore)) {
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'previousVisaValidFrom'],
      bag.previousVisaValidFrom,
      APPLICATION_FORM_MESSAGES.previousVisaValidFromRequired,
    )
    requireConditionalString(
      ctx,
      ['portalFormConditionals', 'previousVisaValidTo'],
      bag.previousVisaValidTo,
      APPLICATION_FORM_MESSAGES.previousVisaValidToRequired,
    )
  }
}
