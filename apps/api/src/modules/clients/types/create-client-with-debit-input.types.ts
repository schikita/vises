/**
 * Optional CRM fields when creating a Client + debit without an Application
 * (DEC-PF-011 / PF-TASK-007 — apps upsert create path).
 */
export type CreateClientWithDebitInput = {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  purpose?: string | null;
  firstEntry?: string | null;
  entries?: string | null;
  durationDays?: string | null;
  relationship?: string | null;
};
