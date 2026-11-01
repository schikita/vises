import type { ClientDto } from '@vises/contracts';
import { formatIso } from '../../../shared/utils';
import type { Client } from '../../database/entities/client.entity';
import { buildMaskedPassport } from './build-masked-passport.util';

/** Map Client + application id → masked ClientDto (FR-5 / FR-6 / AC-10). */
export const mapClientToDto = (
  client: Client,
  applicationId: string,
): ClientDto => {
  return {
    id: client.id,
    agentId: client.agentId,
    applicationId,
    email: client.email,
    phone: client.phone,
    address: client.address,
    purpose: client.purpose,
    firstEntry: client.firstEntry,
    entries: client.entries,
    durationDays: client.durationDays,
    relationship: client.relationship,
    passport: buildMaskedPassport(client),
    createdAt: formatIso(client.createdAt),
    updatedAt: formatIso(client.updatedAt),
  };
};
