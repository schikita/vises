/**
 * API `app_out` + extras shape (REQ-002).
 * Domain owner: `apps` (re-exported from `apps/types`).
 * Physical home in `common/types` while `appOut` mapper lives in `common` (NFR-005 / DEC-011).
 */
export type AppOut = {
  id: string;
  code: string;
  clientEmail: string;
  status: string;
  destination: string;
  visaType: string;
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
