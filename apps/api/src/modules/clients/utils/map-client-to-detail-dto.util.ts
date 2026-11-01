import type { ClientDetailDto } from '@vises/contracts';
import { formatIso } from '../../../shared/utils';
import type { MapClientToDetailDtoInput } from '../types/map-client-to-detail-dto-input.types';

/**
 * Map Client + decrypted FR-6 fields → ClientDetailDto (Decision 2A).
 * Caller must decrypt via PiiModule (Winston audit) before mapping.
 */
export const mapClientToDetailDto = (
  input: MapClientToDetailDtoInput,
): ClientDetailDto => {
  const { client, plaintext } = input;
  return {
    id: client.id,
    agentId: client.agentId,
    firstName: plaintext.firstName ?? null,
    lastName: plaintext.lastName ?? null,
    lastNameAtBirth: plaintext.lastNameAtBirth ?? null,
    dob: plaintext.dob ?? null,
    placeOfBirth: plaintext.placeOfBirth ?? null,
    countryOfBirth: plaintext.countryOfBirth ?? null,
    nationality: plaintext.nationality ?? null,
    nationalityAtBirth: plaintext.nationalityAtBirth ?? null,
    nationalId: plaintext.nationalId ?? null,
    otherNames: plaintext.otherNames ?? null,
    gender: plaintext.gender ?? null,
    maritalStatus: plaintext.maritalStatus ?? null,
    passportNumber: plaintext.passportNumber ?? null,
    passportIssued: plaintext.passportIssued ?? null,
    passportExpires: plaintext.passportExpires ?? null,
    passportType: plaintext.passportType ?? null,
    passportIssueCountry: plaintext.passportIssueCountry ?? null,
    passportIssuedBy: plaintext.passportIssuedBy ?? null,
    applicationId: input.applicationId,
    applicationStatus: input.applicationStatus,
    createdAt: formatIso(client.createdAt),
    updatedAt: formatIso(client.updatedAt),
  };
};
