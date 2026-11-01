import type { Client } from '../../database/entities/client.entity';

export type ClientFactory = {
  create: (data: Partial<Client>) => Client;
};
