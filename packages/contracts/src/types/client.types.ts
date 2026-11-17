import type { ApplicationStatus } from './application-status.types';

/**
 * Masked passport PII on Client create/legacy responses (FR-6 / AC-10).
 * Values are never plaintext — masked strings, or null when unset/anonymized.
 */
export type ClientMaskedPassportDto = {
  passportNumber: string | null;
  passportIssued: string | null;
  passportExpires: string | null;
  passportType: string | null;
  passportIssueCountry: string | null;
  passportIssuedBy: string | null;
  firstName: string | null;
  lastName: string | null;
  lastNameAtBirth: string | null;
  dob: string | null;
  placeOfBirth: string | null;
  countryOfBirth: string | null;
  nationality: string | null;
  nationalityAtBirth: string | null;
  nationalId: string | null;
  otherNames: string | null;
  gender: string | null;
  maritalStatus: string | null;
};

/**
 * Client response DTO with masked passport shape (FR-5 / FR-6 / §6.5).
 * Retained for create/update response backward compatibility (Decision 2A).
 */
export type ClientDto = {
  id: string;
  agentId: string;
  applicationId: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  purpose: string | null;
  firstEntry: string | null;
  entries: string | null;
  durationDays: string | null;
  relationship: string | null;
  passport: ClientMaskedPassportDto;
  /** ISO-8601 timestamp */
  createdAt: string;
  /** ISO-8601 timestamp */
  updatedAt: string;
};

/**
 * Agent-only client create body (FR-5 / §6.5).
 * Passport PII is written via ClientPassportUpdateDto after paid creation.
 */
export type ClientCreateDto = {
  email?: string;
  phone?: string;
  address?: string;
  purpose?: string;
  firstEntry?: string;
  entries?: string;
  durationDays?: string;
  relationship?: string;
};

/**
 * Passport-filling write body (FR-6 encrypted field set / §6.5).
 * Rejected at runtime when no client-creation debit ledger row exists.
 */
export type ClientPassportUpdateDto = {
  passportNumber?: string;
  passportIssued?: string;
  passportExpires?: string;
  passportType?: string;
  passportIssueCountry?: string;
  passportIssuedBy?: string;
  firstName?: string;
  lastName?: string;
  lastNameAtBirth?: string;
  dob?: string;
  placeOfBirth?: string;
  countryOfBirth?: string;
  nationality?: string;
  nationalityAtBirth?: string;
  nationalId?: string;
  otherNames?: string;
  gender?: string;
  maritalStatus?: string;
};

/**
 * Client list row (Decision 2A / T15.1).
 * `maskedPassport` is a single display mask (e.g. `"AB****CD"`); no plaintext passport fields.
 */
export type ClientListDto = {
  id: string;
  agentId: string;
  firstName: string;
  lastName: string;
  maskedPassport: string;
  status: ApplicationStatus;
  /** ISO-8601 timestamp */
  createdAt: string;
};

/**
 * Client detail with FR-6 passport fields in plaintext (Decision 2A / T15.1).
 * FR-6 keys match ClientMaskedPassportDto / ClientPassportUpdateDto.
 */
export type ClientDetailDto = {
  id: string;
  agentId: string;
  firstName: string | null;
  lastName: string | null;
  lastNameAtBirth: string | null;
  dob: string | null;
  placeOfBirth: string | null;
  countryOfBirth: string | null;
  nationality: string | null;
  nationalityAtBirth: string | null;
  nationalId: string | null;
  otherNames: string | null;
  gender: string | null;
  maritalStatus: string | null;
  passportNumber: string | null;
  passportIssued: string | null;
  passportExpires: string | null;
  passportType: string | null;
  passportIssueCountry: string | null;
  passportIssuedBy: string | null;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  /** ISO-8601 timestamp */
  createdAt: string;
  /** ISO-8601 timestamp */
  updatedAt: string;
};
