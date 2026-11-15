/**
 * Opaque booking form field ids for checkpoint `bookingFieldProgress`
 * (ids only — never CRM / portal values) (NFR-002 / VT-TASK-005).
 */
export const PORTAL_BOOKING_FIELD_ID = {
  location: 'location',
  visaType: 'visaType',
  visaSubType: 'visaSubType',
  appointmentFor: 'appointmentFor',
  numberOfMembers: 'numberOfMembers',
  category: 'category',
} as const;
