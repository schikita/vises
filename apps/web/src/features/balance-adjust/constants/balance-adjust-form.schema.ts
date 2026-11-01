import { z } from 'zod'
import { BALANCE_ADJUST_MESSAGES } from './balance-adjust-messages.constants'

/**
 * Signed money decimal string (API `MONEY_DECIMAL_STRING_PATTERN`, non-zero).
 * Kept as string — no float conversion (NFR-1 / AC-10).
 */
export const BALANCE_ADJUST_AMOUNT_PATTERN = /^[+-]?\d+(\.\d{1,2})?$/

export const balanceAdjustFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, BALANCE_ADJUST_MESSAGES.amountRequired)
    .regex(BALANCE_ADJUST_AMOUNT_PATTERN, BALANCE_ADJUST_MESSAGES.amountInvalid)
    .refine((value): boolean => {
      const unsigned = value.replace(/^[+-]/, '')
      const [whole, frac = ''] = unsigned.split('.')
      if (whole === '0' && /^0*$/.test(frac)) {
        return false
      }
      return true
    }, BALANCE_ADJUST_MESSAGES.amountInvalid),
  reason: z.string().trim().min(1, BALANCE_ADJUST_MESSAGES.reasonRequired),
})
