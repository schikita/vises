import { Application } from '../../database/entities/application.entity';
import type { AppOut } from '../types';
import { formatIso } from '../utils';

export type { AppOut };

/** FastAPI `app_out` + `extras_out` parity (REQ-002, REQ-012). */
function extrasOut(app: Application): {
  category: string;
  paused: boolean;
  transfer: boolean;
  submitFrom: string;
  submitTo: string;
} {
  const extras = app.extras || {};
  return {
    category: (extras.category as string) || '',
    paused: Boolean(extras.paused),
    transfer: Boolean(extras.transfer),
    submitFrom: (extras.submitFrom as string) || '',
    submitTo: (extras.submitTo as string) || '',
  };
}

export function appOut(app: Application): AppOut {
  return {
    id: app.id,
    code: app.code,
    clientEmail: app.clientEmail,
    status: app.status,
    destination: app.destination,
    visaType: app.visaType,
    submitCountry: app.submitCountry,
    submitCity: app.submitCity,
    travelDate: app.travelDate,
    returnDate: app.returnDate,
    comment: app.comment || '',
    applicants: app.applicants || [],
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
  };
}
