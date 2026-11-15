import type { ClientPortalFormConditionals } from './client-portal-form-conditionals.types';

/**
 * Dedicated portal-form write body (REQ-002 / REQ-004).
 * Prefer this PATCH over stuffing non-passport keys into ClientPassportUpdateDto (DEC-002).
 * All fields optional (partial update). CamelCase matches EditMemberCrmApplicantSource.
 */
export type ClientPortalFormUpdateDto = {
  /** Home Line1 freeform — existing `clients.address`; included for portal PATCH. */
  address?: string;
  homeAddressLine2?: string;
  homeCountry?: string;
  homeCity?: string;
  homePostalCode?: string;
  employerName?: string;
  employerPhone?: string;
  employerAddress?: string;
  occupation?: string;
  previousFingerPrintStatus?: string;
  previousFingerPrintDate?: string;
  blsInvitingAuthority?: string;
  invitingAuthorityName?: string;
  invitingCountry?: string;
  invitingCity?: string;
  invitingZipCode?: string;
  invitingAddress?: string;
  invitingEmail?: string;
  invitingContactNo?: string;
  invitingFaxNo?: string;
  invitingContactName?: string;
  invitingContactSurname?: string;
  invitingContactCountry?: string;
  invitingContactCity?: string;
  invitingContactZipCode?: string;
  invitingContactAddress?: string;
  invitingContactContactNo?: string;
  invitingContactEmail?: string;
  invitingContactFaxNo?: string;
  costCoveredBy?: string;
  meansOfSupport?: string;
  memberStateSecondDestination?: string;
  portalFormConditionals?: ClientPortalFormConditionals;
};

/**
 * Portal-form read/detail fields (REQ-002 / REQ-004).
 * Null = not yet collected. Separate from ClientDetailDto FR-6 passport plaintext.
 */
export type ClientPortalFormDetailDto = {
  address: string | null;
  homeAddressLine2: string | null;
  homeCountry: string | null;
  homeCity: string | null;
  homePostalCode: string | null;
  employerName: string | null;
  employerPhone: string | null;
  employerAddress: string | null;
  occupation: string | null;
  previousFingerPrintStatus: string | null;
  previousFingerPrintDate: string | null;
  blsInvitingAuthority: string | null;
  invitingAuthorityName: string | null;
  invitingCountry: string | null;
  invitingCity: string | null;
  invitingZipCode: string | null;
  invitingAddress: string | null;
  invitingEmail: string | null;
  invitingContactNo: string | null;
  invitingFaxNo: string | null;
  invitingContactName: string | null;
  invitingContactSurname: string | null;
  invitingContactCountry: string | null;
  invitingContactCity: string | null;
  invitingContactZipCode: string | null;
  invitingContactAddress: string | null;
  invitingContactContactNo: string | null;
  invitingContactEmail: string | null;
  invitingContactFaxNo: string | null;
  costCoveredBy: string | null;
  meansOfSupport: string | null;
  memberStateSecondDestination: string | null;
  portalFormConditionals: ClientPortalFormConditionals | null;
};
