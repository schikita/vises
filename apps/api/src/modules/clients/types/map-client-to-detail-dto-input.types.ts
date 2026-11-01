import type { ApplicationStatus } from '@vises/contracts';
import type { Client } from '../../database/entities/client.entity';
import type { PiiEncryptedFieldMap } from '../../pii';

/** Inputs for mapClientToDetailDto after full FR-6 decrypt. */
export type MapClientToDetailDtoInput = {
  client: Client;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  plaintext: PiiEncryptedFieldMap;
};
