import { z } from 'zod'
import { BALANCE_TOP_UP_MESSAGES } from './balance-top-up-messages.constants'

/**
 * Positive money decimal string (API `MONEY_DECIMAL_STRING_PATTERN`, amount > 0).
 * Kept as string — no float conversion (NFR-1 / AC-10).
 */
export const BALANCE_TOP_UP_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

export const balanceTopUpFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, BALANCE_TOP_UP_MESSAGES.required)
    .regex(BALANCE_TOP_UP_AMOUNT_PATTERN, BALANCE_TOP_UP_MESSAGES.invalid)
    .refine((value): boolean => {
      const [whole, frac = ''] = value.split('.')
      if (whole === '0' && /^0*$/.test(frac)) {
        return false
      }
      return true
    }, BALANCE_TOP_UP_MESSAGES.invalid),
})
