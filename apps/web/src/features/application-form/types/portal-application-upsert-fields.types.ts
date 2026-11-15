/**
 * Application booking/trip fields sourced from the portal one-page form.
 * Merged onto an existing Application before apps upsert (DEC-PF-002).
 */
export type PortalApplicationUpsertFields = {
  destination: string
  visaType: string
  visaSubType: string
  category: string
  submitCountry: string
  submitCity: string
  travelDate: string
  returnDate: string
}
