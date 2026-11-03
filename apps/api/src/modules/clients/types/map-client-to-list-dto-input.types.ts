import type { ApplicationStatus } from '@vises/contracts';
import type { Client } from '../../database/entities/client.entity';

/** Inputs for mapClientToListDto after selective FR-6 decrypt + agent/route enrich. */
export type MapClientToListDtoInput = {
  client: Client;
  status: ApplicationStatus;
  firstName: string | null;
  lastName: string | null;
  passportNumber: string | null;
  agentName: string;
  routeFrom: string | null;
  routeTo: string | null;
};
