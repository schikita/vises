import { Application } from '../../database/entities/application.entity';
import { transliterate } from './transliterate.util';

/**
 * POC-stabilized defaults for portal-required invitation fields that the CRM
 * does not model yet (live-verified values for the seeded application's
 * visa-support documents). Per-application overrides: put the same keys into
 * `application.extras.portalHttpApplicantForm`.
 */
export const APPLICANT_FORM_DEFAULTS: Record<string, string> = {
  IntendedDateOfArrival: '2026-12-20',
  InvitingContactName: 'MARTA',
  InvitingContactSurname: 'GARCIA',
  InvitingContactCity: 'MADRID',
  InvitingContactAddress: 'CALLE SERRANO 88',
  InvitingContactZipCode: '28006',
  InvitingContactEmail: 'marta.garcia@example.com',
  InvitingContactContactNo: '34600000000',
  InvitingAuthorityName: 'SPANISH CONSULATE',
  InvitingCity: 'MADRID',
  InvitingAddress: 'CALLE SERRANO 88',
  InvitingZipCode: '28006',
};

export function addDaysIso(iso: string, days: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}

export function readApplicantFormOverrides(app: Application): Record<string, string> {
  const raw = (app.extras as Record<string, unknown> | null)?.portalHttpApplicantForm;
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) out[key] = value.trim();
  }
  return out;
}

/**
 * Build the ~90-field ManageApplicant form values from CRM data + stabilized
 * defaults + extras.portalHttpApplicantForm overrides. Shared by the STATUS
 * step (Form Filling In-Progress) and the BOOKING step (portal demands the
 * applicant form for the selected visa type — qnKM banner on VisaType submit).
 */
export function buildApplicantFormValues(
  app: Application,
  applicant: NonNullable<Application['applicants']>[number],
): Record<string, string> {
  const arrival =
    String(app.travelDate ?? '').slice(0, 10) || APPLICANT_FORM_DEFAULTS.IntendedDateOfArrival;
  const departure = String(app.returnDate ?? '').slice(0, 10) || addDaysIso(arrival, 14);
  const stayDuration = String(
    Math.max(1, Math.round((Date.parse(departure) - Date.parse(arrival)) / 86_400_000)),
  );
  const phone = String(applicant.phone ?? '').replace(/\D/g, '');
  const overrides = readApplicantFormOverrides(app);
  return {
    FirstName: transliterate(String(applicant.firstName ?? '')),
    SurName: transliterate(String(applicant.lastName ?? '')),
    SurnameAtBirth: transliterate(String(applicant.lastNameAtBirth ?? applicant.lastName ?? '')),
    LastName: transliterate(String(applicant.lastNameAtBirth ?? applicant.lastName ?? '')),
    PlaceOfBirth: transliterate(String(applicant.placeOfBirth ?? '')),
    PassportNo: String(applicant.passportNumber ?? ''),
    IssuePlace: transliterate(String(applicant.passportIssuedBy ?? '')),
    DateOfBirth: String(applicant.dob ?? '').slice(0, 10),
    IssueDate: String(applicant.passportIssued ?? '').slice(0, 10),
    ExpiryDate: String(applicant.passportExpires ?? '').slice(0, 10),
    TravelDate: arrival,
    IntendedDateOfArrival: arrival,
    IntendedDateOfDeparture: departure,
    IntendedStayDuration: stayDuration,
    HomeAddressLine1: 'MINSK',
    HomeAddressCity: 'MINSK',
    HomeAddressPostalCode: '220000',
    HomeAddressContactNumber: phone,
    EmployerName: 'NOT EMPLOYED',
    EmployerPhone: phone,
    EmployerAddress: 'MINSK',
    ...APPLICANT_FORM_DEFAULTS,
    ...overrides,
  };
}
