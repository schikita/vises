import type { Client } from '../../database/entities/client.entity';
import { CLIENT_PORTAL_PLAINTEXT_FIELD_KEYS } from '../constants/client-portal-plaintext-field-keys.constants';
import { PII_ENCRYPTED_FIELD_KEYS } from '../constants/pii-encrypted-fields.constants';
import type { ApplicantInput } from '../types/portal-mapping.types';
import { optionalClientPlaintext } from './optional-client-plaintext.util';

type DecryptPacked = (packed: string) => string;

/**
 * Map a Client row to the portal `ApplicantInput` view (1:1 Client↔Application).
 * FR-6 ciphertext columns are decrypted via `decryptPacked`; plaintext columns
 * (email/phone/portal form/…) are copied as-is when non-empty. Applicant `id`
 * is `client.id`. Never invents values (REQ-007 / REQ-009).
 */
export const mapClientToApplicantInput = (
  client: Client,
  decryptPacked: DecryptPacked,
): ApplicantInput => {
  const decryptField = (value: string | null): string | undefined => {
    if (value == null || value.trim() === '') {
      return undefined;
    }
    return decryptPacked(value);
  };

  const applicant: ApplicantInput = {
    id: client.id,
  };

  const email = optionalClientPlaintext(client.email);
  if (email !== undefined) applicant.email = email;
  const phone = optionalClientPlaintext(client.phone);
  if (phone !== undefined) applicant.phone = phone;
  const address = optionalClientPlaintext(client.address);
  if (address !== undefined) applicant.address = address;
  const purpose = optionalClientPlaintext(client.purpose);
  if (purpose !== undefined) applicant.purpose = purpose;
  const firstEntry = optionalClientPlaintext(client.firstEntry);
  if (firstEntry !== undefined) applicant.firstEntry = firstEntry;
  const entries = optionalClientPlaintext(client.entries);
  if (entries !== undefined) applicant.entries = entries;
  const durationDays = optionalClientPlaintext(client.durationDays);
  if (durationDays !== undefined) applicant.durationDays = durationDays;
  const relationship = optionalClientPlaintext(client.relationship);
  if (relationship !== undefined) applicant.relationship = relationship;

  for (const key of CLIENT_PORTAL_PLAINTEXT_FIELD_KEYS) {
    const plain = optionalClientPlaintext(client[key]);
    if (plain !== undefined) {
      applicant[key] = plain;
    }
  }

  if (client.portalFormConditionals != null) {
    applicant.portalFormConditionals = client.portalFormConditionals;
    const isMinor = client.portalFormConditionals.isMinor;
    if (isMinor !== null && isMinor !== undefined) {
      applicant.isMinor = isMinor;
    }
  }

  for (const key of PII_ENCRYPTED_FIELD_KEYS) {
    const plain = decryptField(client[key]);
    if (plain !== undefined) {
      applicant[key] = plain;
    }
  }

  return applicant;
};

/**
 * Single-element applicant list adapter for callers that still expect an array.
 * Empty when `client` is null/undefined.
 */
export const mapClientToApplicantList = (
  client: Client | null | undefined,
  decryptPacked: DecryptPacked,
): ApplicantInput[] => {
  if (!client) {
    return [];
  }
  return [mapClientToApplicantInput(client, decryptPacked)];
};
