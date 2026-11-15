export type SelectPortalBookingAppointmentForResult =
  | { ok: true; applied: boolean; via: string }
  | { ok: false; error: string; ambiguous: boolean };
