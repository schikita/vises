import { z } from 'zod'
import { SETTINGS_CITY_DESTINATION_MAP } from './settings-city-destination-map.constants'

/** Soft schema — empty company/price coerced at submit; lists must stay non-empty. */
export const settingsEditFormSchema = z.object({
  company: z.string(),
  price: z.string(),
  cities: z
    .array(z.string())
    .min(1, SETTINGS_CITY_DESTINATION_MAP.citiesRequired),
  destinations: z
    .array(z.string())
    .min(1, SETTINGS_CITY_DESTINATION_MAP.destinationsRequired),
})
