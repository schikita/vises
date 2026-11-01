import { z } from 'zod'
import { SETTINGS_PRICE_MESSAGES } from './settings-price-messages.constants'

/**
 * Matches API `PRICE_PER_CLIENT_PATTERN`: whole-number decimal string only
 * (`180` or `180.00`). Kept as string — no float conversion.
 */
export const SETTINGS_PRICE_PATTERN = /^\d+(\.00)?$/

export const settingsPriceFormSchema = z.object({
  price_per_client: z
    .string()
    .trim()
    .min(1, SETTINGS_PRICE_MESSAGES.required)
    .regex(SETTINGS_PRICE_PATTERN, SETTINGS_PRICE_MESSAGES.invalid),
})
