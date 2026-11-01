/** Client-side validation copy for balance adjust (FE8 / AC-10). */
export const BALANCE_ADJUST_MESSAGES = {
  amountRequired: 'Enter an amount',
  amountInvalid:
    'Use a non-zero signed decimal string with up to 2 fractional digits (e.g. -50.00 or 25.5)',
  reasonRequired: 'Enter a reason',
} as const
