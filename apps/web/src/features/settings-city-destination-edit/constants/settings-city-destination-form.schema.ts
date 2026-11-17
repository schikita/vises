import { z } from 'zod'
import { SETTINGS_CITY_DESTINATION_MESSAGES } from './settings-city-destination-messages.constants'

export const settingsCityDestinationFormSchema = z.object({
  cities: z
    .array(z.string())
    .min(1, SETTINGS_CITY_DESTINATION_MESSAGES.citiesRequired),
  destinations: z
    .array(z.string())
    .min(1, SETTINGS_CITY_DESTINATION_MESSAGES.destinationsRequired),
})
