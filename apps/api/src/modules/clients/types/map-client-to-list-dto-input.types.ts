import type { ApplicationStatus } from '@vises/contracts';
import type { Client } from '../../database/entities/client.entity';

/** Inputs for mapClientToListDto after selective FR-6 decrypt. */
export type MapClientToListDtoInput = {
  client: Client;
  status: ApplicationStatus;
  firstName: string | null;
  lastName: string | null;
  passportNumber: string | null;
};
