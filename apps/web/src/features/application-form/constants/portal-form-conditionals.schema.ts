import { z } from 'zod'

/**
 * Optional portalFormConditionals bag (contracts ClientPortalFormConditionals).
 * Controlling flags drive requiredness via refinePortalConditionals — inactive
 * branches stay optional / empty (DEC-PF-007).
 */
export const portalFormConditionalsObjectSchema = z.object({
  isMinor: z.union([z.boolean(), z.string()]).nullable().optional(),
  minorParentSurname: z.string().nullable().optional(),
  minorParentFirstName: z.string().nullable().optional(),
  minorParentLastName: z.string().nullable().optional(),
  minorParentNationality: z.string().nullable().optional(),
  minorParentAddress: z.string().nullable().optional(),
  hasOtherResidenceship: z.union([z.boolean(), z.string()]).nullable().optional(),
  otherResidenceshipPermitValidUntil: z.string().nullable().optional(),
  isVisaIssuedBefore: z.union([z.boolean(), z.string()]).nullable().optional(),
  previousVisaValidFrom: z.string().nullable().optional(),
  previousVisaValidTo: z.string().nullable().optional(),
  finalDestinationIssuedByCountry: z.string().nullable().optional(),
  finalDestinationValidFromDate: z.string().nullable().optional(),
  finalDestinationValidToDate: z.string().nullable().optional(),
  otherCitizenSurname: z.string().nullable().optional(),
  otherCitizenFirstName: z.string().nullable().optional(),
  otherCitizenDateOfBirth: z.string().nullable().optional(),
  otherCitizenNationality: z.string().nullable().optional(),
  otherCitizenDocumentNumber: z.string().nullable().optional(),
  otherCitizenFamilyRelationship: z.string().nullable().optional(),
})
