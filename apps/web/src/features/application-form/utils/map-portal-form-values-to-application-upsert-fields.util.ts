import type { PortalApplicationUpsertFields } from '../types/portal-application-upsert-fields.types'
import type { PortalOnePageFormValues } from '../types/portal-one-page-form.types'

/**
 * Portal booking/travel fields → Application upsert slice.
 * `intendedArrivalDate` shares `travelDate` store (AC-06) — only travelDate is written.
 */
export const mapPortalFormValuesToApplicationUpsertFields = (
  values: PortalOnePageFormValues,
): PortalApplicationUpsertFields => ({
  destination: values.destination.trim(),
  visaType: values.visaType.trim(),
  visaSubType: values.visaSubType.trim(),
  category: values.category.trim(),
  submitCountry: values.submitCountry.trim(),
  submitCity: values.submitCity.trim(),
  travelDate: values.travelDate.trim(),
  returnDate: values.returnDate.trim(),
})
