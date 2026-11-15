import type { CreateClientWithDebitInput } from './create-client-with-debit-input.types';

export type BuildNewClientRowInput = CreateClientWithDebitInput & {
  id: string;
  agentId: string;
  now: Date;
};
