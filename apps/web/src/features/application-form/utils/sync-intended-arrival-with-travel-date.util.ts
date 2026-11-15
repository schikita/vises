import type { TravelArrivalSyncSource } from '../types/travel-arrival-sync.types'

/**
 * Keep Travel Date and Intended Date of Arrival synchronized to one store
 * (`Application.travelDate` / AC-06). Both UI controls share the same value.
 */
export const syncIntendedArrivalWithTravelDate = (
  travelDate: string,
  intendedArrivalDate: string,
  source: TravelArrivalSyncSource,
): { travelDate: string; intendedArrivalDate: string } => {
  if (source === 'travelDate') {
    return { travelDate, intendedArrivalDate: travelDate }
  }
  return { travelDate: intendedArrivalDate, intendedArrivalDate }
}
