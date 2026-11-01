import type { ClientListDto } from '@vises/contracts';
import { formatIso } from '../../../shared/utils';
import type { MapClientToListDtoInput } from '../types/map-client-to-list-dto-input.types';
import { formatMaskedPassportNumber } from './format-masked-passport-number.util';

/**
 * Map Client + decrypted name/passportNumber → ClientListDto (Decision 2A).
 * `firstName` / `lastName` are non-null (empty string when missing).
 * `maskedPassport` never contains plaintext.
 */
export const mapClientToListDto = (
  input: MapClientToListDtoInput,
): ClientListDto => {
  return {
    id: input.client.id,
    agentId: input.client.agentId,
    firstName: input.firstName ?? '',
    lastName: input.lastName ?? '',
    maskedPassport: formatMaskedPassportNumber(input.passportNumber),
    status: input.status,
    createdAt: formatIso(input.client.createdAt),
  };
};
