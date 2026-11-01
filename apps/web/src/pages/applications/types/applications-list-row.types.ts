import type { ApplicationStatus } from '@vises/contracts'

/** Joined apps list row: AppOut + ClientDetailDto.applicationId match (FE10 / AC-9). */
export type ApplicationsListRow = {
  id: string
  code: string
  status: string
  applicationStatus: ApplicationStatus | null
  category: string
  visaType: string
  submitCity: string
  travelDate: string
  clientId: string | null
  clientName: string
}
