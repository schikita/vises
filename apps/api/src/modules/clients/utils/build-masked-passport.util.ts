import type { ClientMaskedPassportDto } from '@vises/contracts';
import type { Client } from '../../database/entities/client.entity';
import { PII_ENCRYPTED_FIELD_KEYS } from '../../pii';
import { MASKED_PASSPORT_VALUE } from '../constants';

/**
 * Map Client encrypted columns → masked passport DTO (AC-10).
 * Set ciphertext → mask placeholder; null/empty → null. Never plaintext.
 */
export const buildMaskedPassport = (client: Client): ClientMaskedPassportDto => {
  const out = {} as ClientMaskedPassportDto;
  for (const key of PII_ENCRYPTED_FIELD_KEYS) {
    const value = client[key];
    out[key] =
      value === null || value === undefined || value === ''
        ? null
        : MASKED_PASSPORT_VALUE;
  }
  return out;
};
