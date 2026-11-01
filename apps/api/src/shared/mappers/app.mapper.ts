import { Application } from '../../modules/database/entities/application.entity';
import type { AppOut } from '../types';
import { formatIso } from '../utils';
import { extrasOut } from './extras-out.mapper';

/** FastAPI `app_out` + `extras_out` parity (REQ-002, REQ-012). */
export const appOut = (app: Application): AppOut => ({
  id: app.id,
  code: app.code,
  clientEmail: app.clientEmail,
  portalFormEmail: app.portalFormEmail ?? null,
  status: app.status,
  destination: app.destination,
  visaType: app.visaType,
  submitCountry: app.submitCountry,
  submitCity: app.submitCity,
  travelDate: app.travelDate,
  returnDate: app.returnDate,
  comment: app.comment || '',
  /** T2: passport PII moved to Client; keep empty array for legacy AppOut shape until FE/API remap. */
  applicants: [],
  documents: app.documents || [],
  paymentAmount: app.paymentAmount,
  paymentPaid: app.paymentPaid,
  paymentNote: app.paymentNote || '',
  visitDate: app.visitDate || '',
  visitTime: app.visitTime || '',
  visitPlace: app.visitPlace || '',
  manager: app.manager || '',
  timeline: app.timeline || [],
  createdAt: formatIso(app.createdAt),
  updatedAt: formatIso(app.updatedAt),
  ...extrasOut(app),
});
