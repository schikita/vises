import type { ApplicationStatus } from '@vises/contracts';

/**
 * API `app_out` + extras shape (REQ-002).
 * Domain owner: `apps` (re-exported from `apps/types`).
 * Physical home in `shared/types` while `appOut` mapper lives in `shared` (NFR-005 / DEC-011).
 * Passport PII lives on Client — no `applicants` jsonb (FR-6 / T12).
 */
export type AppOut = {
  id: string;
  code: string;
  clientId: string;
  clientEmail: string;
  /** Portal RegisterUser / login email; null when unset (REQ-001 / DEC-001). */
  portalFormEmail: string | null;
  status: ApplicationStatus;
  destination: string;
  visaType: string;
  submitCountry: string;
  submitCity: string;
  travelDate: string;
  returnDate: string;
  comment: string;
  documents: unknown[];
  paymentAmount: number;
  paymentPaid: boolean;
  paymentNote: string;
  visitDate: string;
  visitTime: string;
  visitPlace: string;
  manager: string;
  timeline: unknown[];
  createdAt: string;
  updatedAt: string;
  category: string;
  paused: boolean;
  transfer: boolean;
  submitFrom: string;
  submitTo: string;
};
