/** Strip non-digits and cap Belarus local mobile length (portal expects 9). */
export const parseBelarusLocalPhoneDigits = (raw: string): string =>
  raw.replace(/\D/g, '').slice(0, 9)
