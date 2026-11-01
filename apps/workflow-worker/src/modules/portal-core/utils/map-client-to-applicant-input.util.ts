import type { Client } from '../../database/entities/client.entity';
import { PII_ENCRYPTED_FIELD_KEYS } from '../constants/pii-encrypted-fields.constants';
import type { ApplicantInput } from '../types/portal-mapping.types';

type DecryptPacked = (packed: string) => string;

/**
 * Map a Client row to the portal `ApplicantInput` view (1:1 Client↔Application).
 * FR-6 ciphertext columns are decrypted via `decryptPacked`; plaintext columns
 * (email/phone/…) are copied as-is. Applicant `id` is `client.id`.
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
    email: client.email ?? undefined,
    phone: client.phone ?? undefined,
  };

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
