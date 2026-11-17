import type { PrivilegedAppFields } from './privileged-app-fields.types';

export type UpsertPaymentFields = Pick<
  PrivilegedAppFields,
  'paymentAmount' | 'paymentPaid' | 'paymentNote'
>;
