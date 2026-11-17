import type { ClientPortalFormConditionals } from './client-portal-form-conditionals.types';

/**
 * Dedicated portal-form write body (REQ-002 / REQ-004).
 * Prefer this PATCH over stuffing non-passport keys into ClientPassportUpdateDto (DEC-002).
 * All fields optional (partial update). CamelCase matches EditMemberCrmApplicantSource.
 * Journey/contact (`phone`, `purpose`, `firstEntry`, `entries`, `durationDays`) —
 * OQ-PF-001 / portal-form-data-collection (additive; existing Client columns; no migration).
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
  /** Contact Number (home) — existing `clients.phone` (OQ-PF-001). */
  phone?: string;
  /** Purpose of journey — existing `clients.purpose` (OQ-PF-001). */
  purpose?: string;
  /** Member state first entry — existing `clients.first_entry` (OQ-PF-001). */
  firstEntry?: string;
  /** Number of entries — existing `clients.entries` (OQ-PF-001). */
  entries?: string;
  /** Intended stay duration — existing `clients.duration_days` (OQ-PF-001). */
  durationDays?: string;
  portalFormConditionals?: ClientPortalFormConditionals;
};

/**
 * Portal-form read/detail fields (REQ-002 / REQ-004).
 * Null = not yet collected. Separate from ClientDetailDto FR-6 passport plaintext.
 * Journey/contact (`phone`, `purpose`, `firstEntry`, `entries`, `durationDays`) —
 * OQ-PF-001 / portal-form-data-collection (additive; existing Client columns; no migration).
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
  /** Contact Number (home) — existing `clients.phone` (OQ-PF-001). */
  phone: string | null;
  /** Purpose of journey — existing `clients.purpose` (OQ-PF-001). */
  purpose: string | null;
  /** Member state first entry — existing `clients.first_entry` (OQ-PF-001). */
  firstEntry: string | null;
  /** Number of entries — existing `clients.entries` (OQ-PF-001). */
  entries: string | null;
  /** Intended stay duration — existing `clients.duration_days` (OQ-PF-001). */
  durationDays: string | null;
  portalFormConditionals: ClientPortalFormConditionals | null;
};
