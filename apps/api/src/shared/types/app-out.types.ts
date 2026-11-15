/**
 * API `app_out` + extras shape (REQ-002).
 * Domain owner: `apps` (re-exported from `apps/types`).
 * Physical home in `shared/types` while `appOut` mapper lives in `shared` (NFR-005 / DEC-011).
 */
export type AppOut = {
  id: string;
  code: string;
  /** Client id for staff portal-form / passport HTTP routes (1:N per DEC-PF-011). */
  clientId: string;
  clientEmail: string;
  /** Portal RegisterUser / login email; null when unset (REQ-001 / DEC-001). */
  portalFormEmail: string | null;
  status: string;
  destination: string;
  visaType: string;
  /** Portal Visa Sub Type; null when unset (REQ-003 / DEC-003). */
  visaSubType: string | null;
  submitCountry: string;
  submitCity: string;
  travelDate: string;
  returnDate: string;
  comment: string;
  applicants: unknown[];
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
